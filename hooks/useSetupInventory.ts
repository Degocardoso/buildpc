"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  InventoryChange,
  SetupItem,
  SetupItemDraft,
  StorageMode,
} from "@/types/setup";
import { createId } from "@/lib/storage";
import {
  createCloudRepository,
  createLocalRepository,
  readLocalItems,
  type InventoryRepository,
} from "@/lib/repository";

export interface UseSetupInventory {
  items: SetupItem[];
  /** `false` ate o primeiro carregamento no cliente: evita divergencia de hidratacao. */
  hydrated: boolean;
  /** `true` enquanto os itens da nuvem estao sendo baixados. */
  loading: boolean;
  /** `"cloud"` quando ha usuario logado; `"local"` caso contrario. */
  mode: StorageMode;
  /** `true` enquanto uma escrita na nuvem esta em andamento. */
  syncing: boolean;
  /** Erro de persistencia (storage bloqueado, falha de rede, RLS). */
  error: string | null;
  dismissError: () => void;
  addItem: (draft: SetupItemDraft) => void;
  updateItem: (id: string, draft: SetupItemDraft) => void;
  removeItem: (id: string) => void;
  markAsPurchased: (id: string, pricePaid: number, purchaseDate: string) => void;
  mergeItems: (items: SetupItem[]) => Promise<number>;
  /** Envia os itens salvos localmente para a conta na nuvem. */
  uploadLocalItems: () => Promise<number>;
  /** Quantidade de itens guardados no navegador (base da migracao). */
  localItemCount: number;
}

/**
 * Fonte unica de verdade do inventario.
 *
 * O estado inicial e sempre `[]`, igual no servidor e na primeira renderizacao
 * do cliente; os dados so chegam no `useEffect`, quando `hydrated` vira `true`.
 *
 * Sem usuario logado os itens ficam no `localStorage`. Com usuario logado, o
 * repositorio passa a ser o Supabase: a interface e atualizada de forma
 * otimista e, se a gravacao remota falhar, o estado anterior e restaurado.
 */
export function useSetupInventory(userId: string | null): UseSetupInventory {
  const [items, setItems] = useState<SetupItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localItemCount, setLocalItemCount] = useState(0);

  const mode: StorageMode = userId ? "cloud" : "local";

  const repository: InventoryRepository = useMemo(
    () => (userId ? createCloudRepository(userId) : createLocalRepository()),
    [userId],
  );

  // Mantem a lista corrente acessivel dentro dos callbacks sem recria-los a cada item.
  const itemsRef = useRef<SetupItem[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    let active = true;
    setLoading(true);

    repository
      .list()
      .then((loaded) => {
        if (!active) return;
        setItems(loaded);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setItems([]);
        setError(cause instanceof Error ? cause.message : "Falha ao carregar seus itens.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, [repository]);

  // O contador local alimenta o convite de migracao apos o login.
  useEffect(() => {
    setLocalItemCount(readLocalItems().length);
  }, [userId, items]);

  /**
   * Aplica a alteracao na interface imediatamente e persiste em seguida.
   * Em caso de falha, desfaz a alteracao e expoe a mensagem de erro.
   */
  const commit = useCallback(
    async (next: SetupItem[], change: InventoryChange) => {
      const previous = itemsRef.current;
      setItems(next);
      setSyncing(true);

      try {
        await repository.persist(next, change);
        setError(null);
      } catch (cause) {
        setItems(previous);
        setError(cause instanceof Error ? cause.message : "Não foi possível salvar a alteração.");
      } finally {
        setSyncing(false);
      }
    },
    [repository],
  );

  const addItem = useCallback(
    (draft: SetupItemDraft) => {
      const now = new Date().toISOString();
      const item: SetupItem = { ...draft, id: createId(), createdAt: now, updatedAt: now };
      void commit([item, ...itemsRef.current], { type: "upsert", item });
    },
    [commit],
  );

  const updateItem = useCallback(
    (id: string, draft: SetupItemDraft) => {
      const current = itemsRef.current.find((entry) => entry.id === id);
      if (!current) return;

      const item: SetupItem = {
        ...draft,
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };

      void commit(
        itemsRef.current.map((entry) => (entry.id === id ? item : entry)),
        { type: "upsert", item },
      );
    },
    [commit],
  );

  const removeItem = useCallback(
    (id: string) => {
      void commit(
        itemsRef.current.filter((entry) => entry.id !== id),
        { type: "remove", id },
      );
    },
    [commit],
  );

  const markAsPurchased = useCallback(
    (id: string, pricePaid: number, purchaseDate: string) => {
      const current = itemsRef.current.find((entry) => entry.id === id);
      if (!current) return;

      const item: SetupItem = {
        ...current,
        status: "owned",
        pricePaid,
        purchaseDate,
        estimatedPrice: undefined,
        priority: undefined,
        productUrl: undefined,
        updatedAt: new Date().toISOString(),
      };

      void commit(
        itemsRef.current.map((entry) => (entry.id === id ? item : entry)),
        { type: "upsert", item },
      );
    },
    [commit],
  );

  /** Mescla itens importados de um backup, ignorando ids ja cadastrados. */
  const mergeItems = useCallback(
    async (incoming: SetupItem[]): Promise<number> => {
      const known = new Set(itemsRef.current.map((entry) => entry.id));
      const news = incoming.filter((entry) => !known.has(entry.id));
      if (news.length === 0) return 0;

      await commit([...news, ...itemsRef.current], { type: "bulk", items: news });
      return news.length;
    },
    [commit],
  );

  /** Copia o inventario do navegador para a conta na nuvem, sem duplicar. */
  const uploadLocalItems = useCallback(async (): Promise<number> => {
    if (!userId) return 0;

    const known = new Set(itemsRef.current.map((entry) => entry.id));
    const pending = readLocalItems().filter((entry) => !known.has(entry.id));
    if (pending.length === 0) return 0;

    await commit([...pending, ...itemsRef.current], { type: "bulk", items: pending });
    return pending.length;
  }, [commit, userId]);

  const dismissError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      items,
      hydrated,
      loading,
      mode,
      syncing,
      error,
      dismissError,
      addItem,
      updateItem,
      removeItem,
      markAsPurchased,
      mergeItems,
      uploadLocalItems,
      localItemCount,
    }),
    [
      items,
      hydrated,
      loading,
      mode,
      syncing,
      error,
      dismissError,
      addItem,
      updateItem,
      removeItem,
      markAsPurchased,
      mergeItems,
      uploadLocalItems,
      localItemCount,
    ],
  );
}
