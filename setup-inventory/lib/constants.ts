import type { Category, Platform, Priority, SortKey, TabKey } from "@/types/setup";
import { CATEGORIES, PLATFORMS } from "@/types/setup";

/** Chave unica do localStorage. Versionada para permitir migracoes futuras. */
export const STORAGE_KEY = "buildpc:setup-inventory:v1";

export const PLATFORM_OPTIONS: readonly Platform[] = PLATFORMS;
export const CATEGORY_OPTIONS: readonly Category[] = CATEGORIES;

/** Classes Tailwind por ecossistema, usadas em chips e no resumo do dashboard. */
export const PLATFORM_STYLES: Record<
  Platform,
  { chip: string; dot: string; bar: string }
> = {
  PC: {
    chip: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/25",
    dot: "bg-sky-400",
    bar: "bg-sky-500",
  },
  "PS5 / Consoles": {
    chip: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/25",
    dot: "bg-indigo-400",
    bar: "bg-indigo-500",
  },
  "Periféricos": {
    chip: "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-500/25",
    dot: "bg-fuchsia-400",
    bar: "bg-fuchsia-500",
  },
  "Mobiliário & Ergonomia": {
    chip: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/25",
    dot: "bg-amber-400",
    bar: "bg-amber-500",
  },
  "Áudio & Vídeo": {
    chip: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/25",
    dot: "bg-emerald-400",
    bar: "bg-emerald-500",
  },
};

/** Rotulos e cores das prioridades da wishlist. */
export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; weight: number }
> = {
  alta: {
    label: "Alta",
    chip: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/25",
    weight: 0,
  },
  media: {
    label: "Média",
    chip: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/25",
    weight: 1,
  },
  baixa: {
    label: "Baixa",
    chip: "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/25",
    weight: 2,
  },
};

export const PRIORITY_OPTIONS: readonly Priority[] = ["alta", "media", "baixa"];

export const TAB_OPTIONS: readonly { key: TabKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "owned", label: "Meu Setup" },
  { key: "wishlist", label: "Lista de Desejos" },
];

export const SORT_OPTIONS: readonly { key: SortKey; label: string }[] = [
  { key: "date-desc", label: "Data (mais recente)" },
  { key: "date-asc", label: "Data (mais antiga)" },
  { key: "price-desc", label: "Valor (maior primeiro)" },
  { key: "price-asc", label: "Valor (menor primeiro)" },
  { key: "name-asc", label: "Nome (A-Z)" },
];

/** Limite de 2 MB para upload local de imagem convertida em Base64. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
