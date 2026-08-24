import type { SetupItem, SetupItemRow } from "@/types/setup";
import { sanitizeItem } from "@/lib/storage";

/** Converte um `SetupItem` na linha correspondente da tabela do Supabase. */
export function itemToRow(item: SetupItem, userId: string): SetupItemRow {
  const owned = item.status === "owned";

  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    platform: item.platform,
    category: item.category,
    status: item.status,
    price_paid: owned ? item.pricePaid ?? 0 : null,
    purchase_date: owned ? item.purchaseDate ?? null : null,
    estimated_price: owned ? null : item.estimatedPrice ?? 0,
    priority: owned ? null : item.priority ?? "media",
    product_url: owned ? null : item.productUrl ?? null,
    image_url: item.imageUrl ?? null,
    notes: item.notes ?? null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

/**
 * Converte uma linha do banco em `SetupItem`.
 *
 * Reaproveita `sanitizeItem` para que dados inesperados (uma plataforma
 * removida do app, por exemplo) caiam nos mesmos fallbacks usados na
 * importacao de backup, em vez de quebrar a interface.
 */
export function rowToItem(row: SetupItemRow): SetupItem | null {
  const numeric = (value: number | string | null): number | undefined => {
    if (value === null) return undefined;
    const parsed = typeof value === "number" ? value : Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return sanitizeItem({
    id: row.id,
    name: row.name,
    platform: row.platform,
    category: row.category,
    status: row.status,
    pricePaid: numeric(row.price_paid),
    purchaseDate: row.purchase_date,
    estimatedPrice: numeric(row.estimated_price),
    priority: row.priority,
    productUrl: row.product_url,
    imageUrl: row.image_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
