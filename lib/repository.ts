"use client";

import type { InventoryChange, SetupItem } from "@/types/setup";
import { loadItems, saveItems } from "@/lib/storage";
import { itemToRow, rowToItem } from "@/lib/mappers";
import { getSupabase } from "@/lib/supabase";

/**
 * Abstracao sobre onde os itens vivem.
 *
 * `persist` recebe a lista completa ja atualizada **e** a alteracao que a gerou:
 * o repositorio local grava o array inteiro de uma vez, enquanto o repositorio
 * da nuvem traduz a alteracao em uma unica chamada ao Supabase.
 */
export interface InventoryRepository {
  list(): Promise<SetupItem[]>;
  persist(next: SetupItem[], change: InventoryChange): Promise<void>;
}

/** Repositorio local: `localStorage` do navegador. */
export function createLocalRepository(): InventoryRepository {
  return {
    async list() {
      return loadItems();
    },
    async persist(next) {
      if (!saveItems(next)) {
        throw new Error(
          "Não foi possível salvar no navegador. Verifique se o armazenamento local está habilitado.",
        );
      }
    },
  };
}

/** Repositorio da nuvem: tabela `setup_items` protegida por RLS. */
export function createCloudRepository(userId: string): InventoryRepository {
  return {
    async list() {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Sincronização na nuvem não configurada.");

      const { data, error } = await supabase
        .from("setup_items")
        .select("*")
        .eq("user_id", userId);

      if (error) throw new Error(translateDbError(error.message));

      return (data ?? [])
        .map((row) => rowToItem(row))
        .filter((item): item is SetupItem => item !== null);
    },

    async persist(_next, change) {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Sincronização na nuvem não configurada.");

      if (change.type === "remove") {
        const { error } = await supabase
          .from("setup_items")
          .delete()
          .eq("id", change.id)
          .eq("user_id", userId);
        if (error) throw new Error(translateDbError(error.message));
        return;
      }

      const rows =
        change.type === "upsert"
          ? [itemToRow(change.item, userId)]
          : change.items.map((item) => itemToRow(item, userId));

      if (rows.length === 0) return;

      const { error } = await supabase.from("setup_items").upsert(rows, { onConflict: "id" });
      if (error) throw new Error(translateDbError(error.message));
    },
  };
}

/** Mensagens de erro do Postgres/PostgREST traduzidas para o usuario final. */
function translateDbError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("does not exist") || normalized.includes("schema cache")) {
    return "A tabela setup_items não foi encontrada. Rode o arquivo supabase/schema.sql no SQL Editor do Supabase.";
  }
  if (normalized.includes("row-level security") || normalized.includes("violates row-level")) {
    return "Acesso negado pelas políticas de segurança. Confirme que o schema.sql foi executado por completo.";
  }
  if (normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return "Sem conexão com a nuvem. Suas alterações não foram sincronizadas.";
  }
  if (normalized.includes("payload") || normalized.includes("too large")) {
    return "Item muito grande para sincronizar. Use uma URL de imagem em vez de upload local.";
  }

  return message;
}

/** Le os itens locais sem passar pelo repositorio (usado na migracao para a nuvem). */
export function readLocalItems(): SetupItem[] {
  return loadItems();
}
