/**
 * Contratos de dominio da aplicacao de inventario de setup.
 * Todo o app (persistencia, formularios, dashboard e backup) e tipado a partir daqui.
 */

/** Status de um item: ja comprado (inventario) ou planejado (wishlist). */
export type ItemStatus = "owned" | "wishlist";

/** Nivel de prioridade de um item da lista de desejos. */
export type Priority = "alta" | "media" | "baixa";

/** Ecossistemas/plataformas suportados. */
export const PLATFORMS = [
  "PC",
  "PS5 / Consoles",
  "Periféricos",
  "Mobiliário & Ergonomia",
  "Áudio & Vídeo",
] as const;

export type Platform = (typeof PLATFORMS)[number];

/** Categorias de item. */
export const CATEGORIES = [
  "Hardware",
  "Controles",
  "Monitores",
  "Mesa & Cadeira",
  "Cabos & Hubs",
  "Headsets & Áudio",
  "Teclado & Mouse",
  "Jogos & Mídia",
  "Armazenamento",
  "Iluminação",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Item do setup.
 *
 * Os campos financeiros sao mutuamente exclusivos por status:
 * - `owned`    -> usa `pricePaid` + `purchaseDate` (ambos obrigatorios na validacao do formulario);
 * - `wishlist` -> usa `estimatedPrice` + `priority` (e opcionalmente `productUrl`).
 *
 * Eles sao modelados como opcionais para que a conversao entre status
 * (ex.: "Comprei este item!") nao exija recriar o registro.
 */
export interface SetupItem {
  /** Identificador unico e estavel (uuid v4 quando disponivel). */
  id: string;
  /** Nome do item. Ex.: "PlayStation 5 Slim". */
  name: string;
  /** Ecossistema ao qual o item pertence. */
  platform: Platform;
  /** Categoria do item. */
  category: Category;
  /** Status atual do item. */
  status: ItemStatus;

  /** Valor efetivamente pago, em BRL. Presente quando `status === "owned"`. */
  pricePaid?: number;
  /** Data da compra no formato ISO `YYYY-MM-DD`. Presente quando `status === "owned"`. */
  purchaseDate?: string;

  /** Valor estimado, em BRL. Presente quando `status === "wishlist"`. */
  estimatedPrice?: number;
  /** Prioridade de compra. Presente quando `status === "wishlist"`. */
  priority?: Priority;
  /** Link do produto (URL). Opcional. */
  productUrl?: string;

  /** URL externa da imagem ou data URI Base64 gerado por upload local. */
  imageUrl?: string;
  /** Observacoes livres, loja onde foi comprado, garantia etc. */
  notes?: string;

  /** Timestamps ISO 8601 de criacao e ultima atualizacao. */
  createdAt: string;
  updatedAt: string;
}

/** Payload aceito pelos formularios de criacao/edicao (o restante e derivado). */
export type SetupItemDraft = Omit<SetupItem, "id" | "createdAt" | "updatedAt">;

/** Abas de navegacao rapida. */
export type TabKey = "all" | "owned" | "wishlist";

/** Criterios de ordenacao da listagem. */
export type SortKey =
  | "date-desc"
  | "date-asc"
  | "price-desc"
  | "price-asc"
  | "name-asc";

/** Estado dos filtros da listagem. */
export interface FilterState {
  tab: TabKey;
  search: string;
  platform: Platform | "all";
  category: Category | "all";
  sort: SortKey;
}

/** Totais financeiros de um recorte de itens. */
export interface Totals {
  /** Soma dos itens com status `owned`. */
  spent: number;
  /** Soma dos itens com status `wishlist`. */
  planned: number;
  /** `spent + planned`: valor do setup completo. */
  total: number;
  /** Quantidade de itens comprados. */
  ownedCount: number;
  /** Quantidade de itens desejados. */
  wishlistCount: number;
}

/** Recorte de totais por ecossistema, usado no resumo do dashboard. */
export interface PlatformBreakdown extends Totals {
  platform: Platform;
}

/** Formato do arquivo de backup exportado/importado (.json). */
export interface BackupFile {
  /** Marcador do formato, validado na importacao. */
  app: "setup-inventory";
  /** Versao do schema do backup. */
  version: 1;
  /** Data/hora ISO da exportacao. */
  exportedAt: string;
  items: SetupItem[];
}

/** Modo de armazenamento em uso. */
export type StorageMode = "local" | "cloud";

/**
 * Linha da tabela `public.setup_items` no Supabase (snake_case).
 * Convertida de/para `SetupItem` em `lib/mappers.ts`.
 */
export interface SetupItemRow {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  category: string;
  status: string;
  price_paid: number | string | null;
  purchase_date: string | null;
  estimated_price: number | string | null;
  priority: string | null;
  product_url: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Descreve a alteracao que deve ser propagada para o armazenamento. */
export type InventoryChange =
  | { type: "upsert"; item: SetupItem }
  | { type: "remove"; id: string }
  | { type: "bulk"; items: SetupItem[] };
