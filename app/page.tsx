"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import type {
  FilterState,
  ItemStatus,
  SetupItem,
  SetupItemDraft,
  TabKey,
} from "@/types/setup";
import { useAuth } from "@/hooks/useAuth";
import { useSetupInventory } from "@/hooks/useSetupInventory";
import { applyFilters } from "@/lib/analytics";
import { buildBackup, downloadJSON, parseBackup } from "@/lib/storage";
import { todayISO } from "@/lib/format";
import { AuthModal } from "@/components/AuthModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dashboard } from "@/components/Dashboard";
import { EmptyState } from "@/components/EmptyState";
import { FiltersBar } from "@/components/FiltersBar";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { ItemFormModal } from "@/components/ItemFormModal";
import { PurchaseModal } from "@/components/PurchaseModal";
import { SyncBanner } from "@/components/SyncBanner";
import { Toast, type ToastMessage } from "@/components/Toast";

const INITIAL_FILTERS: FilterState = {
  tab: "all",
  search: "",
  platform: "all",
  category: "all",
  sort: "date-desc",
};

export default function HomePage() {
  const { cloudEnabled, user, ready: authReady, signIn, signUp, signOut, resetPassword } = useAuth();

  const {
    items,
    hydrated,
    loading,
    mode,
    syncing,
    error: storageError,
    dismissError,
    addItem,
    updateItem,
    removeItem,
    markAsPurchased,
    mergeItems,
    uploadLocalItems,
    localItemCount,
  } = useSetupInventory(user?.id ?? null);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SetupItem | null>(null);
  const [formStatus, setFormStatus] = useState<ItemStatus>("owned");
  const [purchasingItem, setPurchasingItem] = useState<SetupItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SetupItem | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [uploading, setUploading] = useState(false);

  const notify = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  const visibleItems = useMemo(() => applyFilters(items, filters), [items, filters]);

  const counts = useMemo<Record<TabKey, number>>(
    () => ({
      all: items.length,
      owned: items.filter((item) => item.status === "owned").length,
      wishlist: items.filter((item) => item.status === "wishlist").length,
    }),
    [items],
  );

  function handleFilterChange(patch: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function openCreateForm() {
    setEditingItem(null);
    setFormStatus(filters.tab === "wishlist" ? "wishlist" : "owned");
    setFormOpen(true);
  }

  function openEditForm(item: SetupItem) {
    setEditingItem(item);
    setFormStatus(item.status);
    setFormOpen(true);
  }

  function handleFormSubmit(draft: SetupItemDraft) {
    if (editingItem) {
      updateItem(editingItem.id, draft);
      notify("Item atualizado com sucesso.");
    } else {
      addItem(draft);
      notify(
        draft.status === "owned"
          ? "Item adicionado ao seu setup."
          : "Item adicionado à lista de desejos.",
      );
    }
    setFormOpen(false);
    setEditingItem(null);
  }

  function handleConfirmPurchase(id: string, pricePaid: number, purchaseDate: string) {
    markAsPurchased(id, pricePaid, purchaseDate);
    setPurchasingItem(null);
    notify("Parabéns! O item foi movido para o seu inventário.");
  }

  function handleConfirmDelete() {
    if (!deletingItem) return;
    removeItem(deletingItem.id);
    setDeletingItem(null);
    notify("Item excluído.");
  }

  function handleExport() {
    if (items.length === 0) {
      notify("Não há itens para exportar.", "error");
      return;
    }
    downloadJSON(buildBackup(items), `setup-inventory-${todayISO()}.json`);
    notify(`Backup exportado com ${items.length} itens.`);
  }

  async function handleImport(file: File) {
    try {
      const imported = parseBackup(await file.text());
      if (imported.length === 0) {
        notify("Nenhum item válido encontrado no arquivo.", "error");
        return;
      }
      const added = await mergeItems(imported);
      notify(
        added === 0
          ? "Todos os itens do backup já estavam cadastrados."
          : `${added} ${added === 1 ? "item importado" : "itens importados"} com sucesso.`,
        added === 0 ? "error" : "success",
      );
    } catch {
      notify("Arquivo inválido. Selecione um backup .json gerado pelo app.", "error");
    }
  }

  async function handleUploadLocal() {
    setUploading(true);
    try {
      const sent = await uploadLocalItems();
      notify(
        sent === 0
          ? "Seus itens locais já estavam na nuvem."
          : `${sent} ${sent === 1 ? "item enviado" : "itens enviados"} para a sua conta.`,
      );
      setBannerDismissed(true);
    } finally {
      setUploading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    notify("Você saiu da conta. Os dados continuam salvos na nuvem.");
  }

  // Reapresenta o banner a cada troca de conta (login, logout).
  useEffect(() => {
    setBannerDismissed(false);
  }, [user?.id]);

  const emptyByTab: Record<TabKey, { title: string; message: string }> = {
    all: {
      title: "Seu setup ainda está vazio",
      message:
        "Cadastre o que você já possui para calcular o total investido e adicione os próximos upgrades à lista de desejos.",
    },
    owned: {
      title: "Nenhum item comprado ainda",
      message: "Adicione os itens que já fazem parte do seu setup com o valor e a data da compra.",
    },
    wishlist: {
      title: "Sua lista de desejos está vazia",
      message: "Planeje os próximos upgrades com preço estimado, prioridade e link do produto.",
    },
  };

  const hasItemsInTab = counts[filters.tab] > 0;

  return (
    <div className="min-h-screen">
      <Header
        cloudEnabled={cloudEnabled}
        mode={mode}
        userEmail={user?.email ?? null}
        syncing={syncing}
        onAdd={openCreateForm}
        onExport={handleExport}
        onImport={handleImport}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {storageError ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          >
            <p className="flex-1">{storageError}</p>
            <button
              type="button"
              onClick={dismissError}
              aria-label="Dispensar aviso"
              className="shrink-0 rounded p-0.5 opacity-70 transition hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {authReady && !bannerDismissed ? (
          <SyncBanner
            cloudEnabled={cloudEnabled}
            mode={mode}
            pendingLocalCount={mode === "cloud" ? localItemCount : 0}
            uploading={uploading}
            onSignIn={() => setAuthOpen(true)}
            onUpload={handleUploadLocal}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}

        <Dashboard items={items} />

        <FiltersBar
          filters={filters}
          counts={counts}
          resultCount={visibleItems.length}
          onChange={handleFilterChange}
          onReset={() => setFilters((current) => ({ ...INITIAL_FILTERS, tab: current.tab }))}
        />

        {!hydrated || loading || !authReady ? (
          <div className="card flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            {mode === "cloud" ? "Carregando seu setup da nuvem..." : "Carregando seu inventário..."}
          </div>
        ) : visibleItems.length === 0 ? (
          <EmptyState
            title={hasItemsInTab ? "Nenhum item corresponde aos filtros" : emptyByTab[filters.tab].title}
            message={
              hasItemsInTab
                ? "Ajuste a busca, a plataforma ou a categoria para encontrar o que procura."
                : emptyByTab[filters.tab].message
            }
            actionLabel={hasItemsInTab ? undefined : "Adicionar primeiro item"}
            onAction={hasItemsInTab ? undefined : openCreateForm}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map((item) => (
              <li key={item.id} className="flex">
                <div className="w-full">
                  <ItemCard
                    item={item}
                    onEdit={openEditForm}
                    onDelete={setDeletingItem}
                    onPurchase={setPurchasingItem}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className="pt-4 text-center text-xs text-slate-600">
          {mode === "cloud"
            ? "Seus dados estão salvos na sua conta e sincronizam entre dispositivos."
            : "Os dados ficam salvos apenas neste navegador. Exporte um backup .json regularmente."}
        </footer>
      </main>

      <ItemFormModal
        open={formOpen}
        item={editingItem}
        defaultStatus={formStatus}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <PurchaseModal
        item={purchasingItem}
        onClose={() => setPurchasingItem(null)}
        onConfirm={handleConfirmPurchase}
      />

      <ConfirmDialog
        open={deletingItem !== null}
        title="Excluir item"
        message={
          deletingItem
            ? `Tem certeza que deseja excluir "${deletingItem.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignIn={signIn}
        onSignUp={signUp}
        onResetPassword={resetPassword}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
