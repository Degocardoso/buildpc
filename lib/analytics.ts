import type {
  FilterState,
  PlatformBreakdown,
  SetupItem,
  Totals,
} from "@/types/setup";
import { PLATFORMS } from "@/types/setup";
import { PRIORITY_META } from "@/lib/constants";

/** Valor financeiro relevante do item, conforme o status. */
export function itemValue(item: SetupItem): number {
  return (item.status === "owned" ? item.pricePaid : item.estimatedPrice) ?? 0;
}

/** Calcula os totais (gasto, previsto e setup completo) de uma lista de itens. */
export function computeTotals(items: SetupItem[]): Totals {
  return items.reduce<Totals>(
    (acc, item) => {
      const value = itemValue(item);
      if (item.status === "owned") {
        acc.spent += value;
        acc.ownedCount += 1;
      } else {
        acc.planned += value;
        acc.wishlistCount += 1;
      }
      acc.total = acc.spent + acc.planned;
      return acc;
    },
    { spent: 0, planned: 0, total: 0, ownedCount: 0, wishlistCount: 0 },
  );
}

/** Totais separados por ecossistema, na ordem canonica das plataformas. */
export function computeBreakdown(items: SetupItem[]): PlatformBreakdown[] {
  return PLATFORMS.map((platform) => ({
    platform,
    ...computeTotals(items.filter((item) => item.platform === platform)),
  }));
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Ordena a data de compra ausente sempre para o fim da lista. */
function dateKey(item: SetupItem): string {
  return item.purchaseDate ?? "";
}

/** Aplica aba, busca, filtros e ordenacao sobre a lista completa. */
export function applyFilters(items: SetupItem[], filters: FilterState): SetupItem[] {
  const term = normalize(filters.search.trim());

  const filtered = items.filter((item) => {
    if (filters.tab !== "all" && item.status !== filters.tab) return false;
    if (filters.platform !== "all" && item.platform !== filters.platform) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (!term) return true;
    return (
      normalize(item.name).includes(term) ||
      normalize(item.notes ?? "").includes(term) ||
      normalize(item.category).includes(term) ||
      normalize(item.platform).includes(term)
    );
  });

  const sorted = [...filtered];

  switch (filters.sort) {
    case "date-asc":
      sorted.sort((a, b) => {
        const keyA = dateKey(a);
        const keyB = dateKey(b);
        if (!keyA && !keyB) return a.name.localeCompare(b.name, "pt-BR");
        if (!keyA) return 1;
        if (!keyB) return -1;
        return keyA.localeCompare(keyB);
      });
      break;
    case "price-desc":
      sorted.sort((a, b) => itemValue(b) - itemValue(a));
      break;
    case "price-asc":
      sorted.sort((a, b) => itemValue(a) - itemValue(b));
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      break;
    case "date-desc":
    default:
      sorted.sort((a, b) => {
        const keyA = dateKey(a);
        const keyB = dateKey(b);
        if (!keyA && !keyB) {
          // Sem data (wishlist): prioridade primeiro, depois maior valor.
          const priorityA = PRIORITY_META[a.priority ?? "media"].weight;
          const priorityB = PRIORITY_META[b.priority ?? "media"].weight;
          if (priorityA !== priorityB) return priorityA - priorityB;
          return itemValue(b) - itemValue(a);
        }
        if (!keyA) return 1;
        if (!keyB) return -1;
        return keyB.localeCompare(keyA);
      });
      break;
  }

  return sorted;
}
