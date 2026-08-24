"use client";

import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { Category, FilterState, Platform, SortKey, TabKey } from "@/types/setup";
import {
  CATEGORY_OPTIONS,
  PLATFORM_OPTIONS,
  SORT_OPTIONS,
  TAB_OPTIONS,
} from "@/lib/constants";

interface FiltersBarProps {
  filters: FilterState;
  counts: Record<TabKey, number>;
  resultCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
}

/** Abas rapidas + busca, filtros por plataforma/categoria e ordenacao. */
export function FiltersBar({ filters, counts, resultCount, onChange, onReset }: FiltersBarProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.platform !== "all" ||
    filters.category !== "all" ||
    filters.sort !== "date-desc";

  return (
    <section aria-label="Filtros" className="space-y-3">
      <div
        role="tablist"
        aria-label="Filtrar por status"
        className="flex w-full gap-1 overflow-x-auto rounded-xl border border-surface-700 bg-surface-900/80 p-1 scrollbar-thin"
      >
        {TAB_OPTIONS.map((tab) => {
          const active = filters.tab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange({ tab: tab.key })}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium transition sm:gap-2 sm:px-3 sm:text-sm ${
                active
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                  : "text-slate-400 hover:bg-surface-800 hover:text-slate-100"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
                  active ? "bg-white/20 text-white" : "bg-surface-700 text-slate-400"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Buscar por nome, loja ou categoria..."
            aria-label="Buscar itens"
            className="field pl-9"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <select
            value={filters.platform}
            onChange={(event) =>
              onChange({ platform: event.target.value as Platform | "all" })
            }
            aria-label="Filtrar por plataforma"
            className="field appearance-none pl-9"
          >
            <option value="all">Todas as plataformas</option>
            {PLATFORM_OPTIONS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <select
          value={filters.category}
          onChange={(event) =>
            onChange({ category: event.target.value as Category | "all" })
          }
          aria-label="Filtrar por categoria"
          className="field appearance-none"
        >
          <option value="all">Todas as categorias</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <select
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value as SortKey })}
            aria-label="Ordenar itens"
            className="field appearance-none pl-9"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-1 text-xs text-slate-500">
        <span>
          {resultCount} {resultCount === 1 ? "item encontrado" : "itens encontrados"}
        </span>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-slate-400 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        ) : null}
      </div>
    </section>
  );
}
