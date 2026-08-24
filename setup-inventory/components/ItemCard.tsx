"use client";

import {
  CalendarDays,
  ExternalLink,
  ImageOff,
  Pencil,
  ShoppingCart,
  StickyNote,
  Trash2,
} from "lucide-react";
import type { SetupItem } from "@/types/setup";
import { PLATFORM_STYLES, PRIORITY_META } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

interface ItemCardProps {
  item: SetupItem;
  onEdit: (item: SetupItem) => void;
  onDelete: (item: SetupItem) => void;
  onPurchase: (item: SetupItem) => void;
}

/** Cartao visual de um item, com foto, tags, preco e acoes. */
export function ItemCard({ item, onEdit, onDelete, onPurchase }: ItemCardProps) {
  const owned = item.status === "owned";
  const platformStyle = PLATFORM_STYLES[item.platform];
  const priority = item.priority ? PRIORITY_META[item.priority] : null;
  const price = owned ? item.pricePaid ?? 0 : item.estimatedPrice ?? 0;

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:border-surface-600 hover:shadow-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-850">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-600">
            <ImageOff className="h-7 w-7" />
            <span className="text-[11px]">Sem imagem</span>
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span className={`chip ${platformStyle.chip}`}>{item.platform}</span>
        </div>

        <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1.5">
          {owned ? (
            <span className="chip bg-emerald-500/20 text-emerald-200 ring-1 ring-inset ring-emerald-500/30">
              Comprado
            </span>
          ) : (
            <>
              <span className="chip bg-slate-900/80 text-slate-200 ring-1 ring-inset ring-white/10">
                Desejado
              </span>
              {priority ? (
                <span className={`chip ${priority.chip}`}>{priority.label}</span>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white" title={item.name}>
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{item.category}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {owned ? "Preço pago" : "Preço estimado"}
            </p>
            <p
              className={`text-lg font-semibold ${owned ? "text-emerald-400" : "text-amber-400"}`}
            >
              {formatCurrency(price)}
            </p>
          </div>

          {owned ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-850 px-2 py-1 text-xs text-slate-300">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
              {formatDate(item.purchaseDate)}
            </span>
          ) : item.productUrl ? (
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-850 px-2 py-1 text-xs text-brand-400 transition hover:text-brand-500"
            >
              Ver produto
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        {item.notes ? (
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
            <span className="line-clamp-2">{item.notes}</span>
          </p>
        ) : null}

        <div className="mt-auto space-y-2 border-t border-surface-700 pt-3">
          {!owned ? (
            <button
              type="button"
              onClick={() => onPurchase(item)}
              className="btn-primary w-full !py-1.5 text-xs"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Comprei este item!
            </button>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="btn-ghost flex-1 !py-1.5 text-xs"
              aria-label={`Editar ${item.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              className="btn-ghost !px-2 !py-1.5 text-xs hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
              aria-label={`Excluir ${item.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
