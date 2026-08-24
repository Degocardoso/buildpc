"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import type {
  Category,
  ItemStatus,
  Platform,
  Priority,
  SetupItem,
  SetupItemDraft,
} from "@/types/setup";
import {
  CATEGORY_OPTIONS,
  MAX_IMAGE_BYTES,
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_META,
} from "@/lib/constants";
import { formatCurrency, parseCurrencyInput, todayISO } from "@/lib/format";
import { fileToBase64 } from "@/lib/storage";
import { Modal } from "@/components/Modal";

/** Estado do formulario: todos os campos como string para espelhar os inputs. */
interface FormState {
  name: string;
  platform: Platform;
  category: Category;
  status: ItemStatus;
  price: string;
  purchaseDate: string;
  priority: Priority;
  productUrl: string;
  imageUrl: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function emptyForm(status: ItemStatus): FormState {
  return {
    name: "",
    platform: "PC",
    category: "Hardware",
    status,
    price: "",
    purchaseDate: status === "owned" ? todayISO() : "",
    priority: "media",
    productUrl: "",
    imageUrl: "",
    notes: "",
  };
}

function formFromItem(item: SetupItem): FormState {
  const price = item.status === "owned" ? item.pricePaid : item.estimatedPrice;
  return {
    name: item.name,
    platform: item.platform,
    category: item.category,
    status: item.status,
    price: price != null ? String(price).replace(".", ",") : "",
    purchaseDate: item.purchaseDate ?? "",
    priority: item.priority ?? "media",
    productUrl: item.productUrl ?? "",
    imageUrl: item.imageUrl ?? "",
    notes: item.notes ?? "",
  };
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const price = parseCurrencyInput(form.price);

  if (!form.name.trim()) errors.name = "Informe o nome do item.";
  if (!form.price.trim() || price <= 0) errors.price = "Informe um valor maior que zero.";

  if (form.status === "owned") {
    if (!form.purchaseDate) {
      errors.purchaseDate = "A data da compra é obrigatória (DD/MM/AAAA).";
    } else if (form.purchaseDate > todayISO()) {
      errors.purchaseDate = "A data da compra não pode estar no futuro.";
    }
  }

  if (form.status === "wishlist" && form.productUrl.trim()) {
    try {
      const url = new URL(form.productUrl.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.productUrl = "Use um link http:// ou https://";
      }
    } catch {
      errors.productUrl = "Link inválido. Exemplo: https://loja.com/produto";
    }
  }

  return errors;
}

function toDraft(form: FormState): SetupItemDraft {
  const price = parseCurrencyInput(form.price);
  const base = {
    name: form.name.trim(),
    platform: form.platform,
    category: form.category,
    status: form.status,
    imageUrl: form.imageUrl.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };

  if (form.status === "owned") {
    return { ...base, pricePaid: price, purchaseDate: form.purchaseDate };
  }

  return {
    ...base,
    estimatedPrice: price,
    priority: form.priority,
    productUrl: form.productUrl.trim() || undefined,
  };
}

interface ItemFormModalProps {
  open: boolean;
  /** Item em edicao, ou `null` para criacao. */
  item: SetupItem | null;
  /** Status inicial ao criar um novo item. */
  defaultStatus: ItemStatus;
  onClose: () => void;
  onSubmit: (draft: SetupItemDraft) => void;
}

/** Formulario de cadastro e edicao, com campos condicionais por status. */
export function ItemFormModal({
  open,
  item,
  defaultStatus,
  onClose,
  onSubmit,
}: ItemFormModalProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultStatus));
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reinicia o formulario a cada abertura do modal.
  useEffect(() => {
    if (!open) return;
    setForm(item ? formFromItem(item) : emptyForm(defaultStatus));
    setErrors({});
    setImageError(null);
    setImageLoading(false);
  }, [open, item, defaultStatus]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleStatusChange(status: ItemStatus) {
    setForm((current) => ({
      ...current,
      status,
      purchaseDate:
        status === "owned" && !current.purchaseDate ? todayISO() : current.purchaseDate,
    }));
    setErrors({});
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Imagem muito grande. O limite é 2 MB.");
      return;
    }

    setImageLoading(true);
    try {
      const base64 = await fileToBase64(file);
      setField("imageUrl", base64);
    } catch {
      setImageError("Não foi possível ler a imagem selecionada.");
    } finally {
      setImageLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(toDraft(form));
  }

  const owned = form.status === "owned";
  const parsedPrice = parseCurrencyInput(form.price);

  return (
    <Modal
      open={open}
      title={item ? "Editar item" : "Adicionar item"}
      description={
        item
          ? "Atualize as informações deste item do seu setup."
          : "Cadastre um item já comprado ou adicione à sua lista de desejos."
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <fieldset>
          <legend className="label">Status</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["owned", "wishlist"] as const).map((status) => {
              const active = form.status === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? status === "owned"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-500/50 bg-amber-500/10 text-amber-300"
                      : "border-surface-600 bg-surface-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {status === "owned" ? "Comprado" : "Lista de desejos"}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label className="label" htmlFor="item-name">
            Nome do item *
          </label>
          <input
            id="item-name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Ex.: PlayStation 5 Slim, RTX 4070, Suporte Articulado"
            className="field"
            autoFocus
          />
          {errors.name ? <p className="mt-1 text-xs text-rose-400">{errors.name}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="item-platform">
              Plataforma / Ecossistema
            </label>
            <select
              id="item-platform"
              value={form.platform}
              onChange={(event) => setField("platform", event.target.value as Platform)}
              className="field"
            >
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="item-category">
              Categoria
            </label>
            <select
              id="item-category"
              value={form.category}
              onChange={(event) => setField("category", event.target.value as Category)}
              className="field"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="item-price">
              {owned ? "Preço pago (R$) *" : "Preço estimado (R$) *"}
            </label>
            <input
              id="item-price"
              inputMode="decimal"
              value={form.price}
              onChange={(event) => setField("price", event.target.value)}
              placeholder="0,00"
              className="field"
            />
            {errors.price ? (
              <p className="mt-1 text-xs text-rose-400">{errors.price}</p>
            ) : parsedPrice > 0 ? (
              <p className="mt-1 text-xs text-slate-500">{formatCurrency(parsedPrice)}</p>
            ) : null}
          </div>

          {owned ? (
            <div>
              <label className="label" htmlFor="item-date">
                Data da compra *
              </label>
              <input
                id="item-date"
                type="date"
                value={form.purchaseDate}
                max={todayISO()}
                onChange={(event) => setField("purchaseDate", event.target.value)}
                className="field"
              />
              {errors.purchaseDate ? (
                <p className="mt-1 text-xs text-rose-400">{errors.purchaseDate}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">Dia, mês e ano são obrigatórios.</p>
              )}
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="item-priority">
                Prioridade
              </label>
              <select
                id="item-priority"
                value={form.priority}
                onChange={(event) => setField("priority", event.target.value as Priority)}
                className="field"
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_META[priority].label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!owned ? (
          <div>
            <label className="label" htmlFor="item-url">
              Link do produto (opcional)
            </label>
            <input
              id="item-url"
              type="url"
              value={form.productUrl}
              onChange={(event) => setField("productUrl", event.target.value)}
              placeholder="https://loja.com/produto"
              className="field"
            />
            {errors.productUrl ? (
              <p className="mt-1 text-xs text-rose-400">{errors.productUrl}</p>
            ) : null}
          </div>
        ) : null}

        <div>
          <span className="label">Imagem (URL externa ou upload local)</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-surface-600 bg-surface-850">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt="Pré-visualização do item"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-600">
                  <ImagePlus className="h-6 w-6" />
                </div>
              )}
              {imageLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                onChange={(event) => setField("imageUrl", event.target.value)}
                placeholder={
                  form.imageUrl.startsWith("data:")
                    ? "Imagem local carregada (Base64)"
                    : "https://exemplo.com/imagem.jpg"
                }
                disabled={form.imageUrl.startsWith("data:")}
                className="field"
                aria-label="URL da imagem"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-ghost !py-1.5 text-xs"
                  disabled={imageLoading}
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Enviar arquivo
                </button>
                {form.imageUrl ? (
                  <button
                    type="button"
                    onClick={() => setField("imageUrl", "")}
                    className="btn-ghost !py-1.5 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imageError ? (
                <p className="text-xs text-rose-400">{imageError}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Arquivos locais são convertidos em Base64 (máx. 2 MB).
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="item-notes">
            Observações / Loja (opcional)
          </label>
          <textarea
            id="item-notes"
            rows={3}
            value={form.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Ex.: Comprado na Kabum em promoção, garantia até 2027."
            className="field resize-y"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-surface-700 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" />
            {item ? "Salvar alterações" : "Adicionar ao setup"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
