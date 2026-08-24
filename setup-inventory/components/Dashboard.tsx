"use client";

import { useMemo } from "react";
import { Layers, PiggyBank, Target, Wallet } from "lucide-react";
import type { SetupItem } from "@/types/setup";
import { computeBreakdown, computeTotals } from "@/lib/analytics";
import { formatCurrency, percentOf } from "@/lib/format";
import { PLATFORM_STYLES } from "@/lib/constants";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
  ring: string;
}

function StatCard({ label, value, hint, icon, accent, ring }: StatCardProps) {
  return (
    <div className={`card relative overflow-hidden p-4 sm:p-5 ${ring}`}>
      <div
        className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl ${accent}`}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-semibold text-white sm:text-[1.75rem]">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="shrink-0 rounded-xl border border-surface-700 bg-surface-850 p-2 text-slate-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface DashboardProps {
  items: SetupItem[];
}

/** Cartoes financeiros do topo + resumo por ecossistema. */
export function Dashboard({ items }: DashboardProps) {
  const totals = useMemo(() => computeTotals(items), [items]);
  const breakdown = useMemo(
    () => computeBreakdown(items).filter((entry) => entry.total > 0),
    [items],
  );

  return (
    <section aria-label="Resumo financeiro" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total já gasto"
          value={formatCurrency(totals.spent)}
          hint={`${totals.ownedCount} ${totals.ownedCount === 1 ? "item comprado" : "itens comprados"}`}
          icon={<Wallet className="h-5 w-5 text-emerald-400" />}
          accent="bg-emerald-500/20"
          ring="ring-1 ring-inset ring-emerald-500/15"
        />
        <StatCard
          label="Total previsto (wishlist)"
          value={formatCurrency(totals.planned)}
          hint={`${totals.wishlistCount} ${totals.wishlistCount === 1 ? "item desejado" : "itens desejados"}`}
          icon={<Target className="h-5 w-5 text-amber-400" />}
          accent="bg-amber-500/20"
          ring="ring-1 ring-inset ring-amber-500/15"
        />
        <StatCard
          label="Setup completo"
          value={formatCurrency(totals.total)}
          hint="Gasto atual + investimento planejado"
          icon={<PiggyBank className="h-5 w-5 text-sky-400" />}
          accent="bg-sky-500/20"
          ring="ring-1 ring-inset ring-sky-500/15"
        />
      </div>

      <div className="card p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Resumo por ecossistema</h2>
        </div>

        {breakdown.length === 0 ? (
          <p className="text-sm text-slate-500">
            Cadastre itens para ver a distribuição de investimento entre PC, consoles, periféricos e
            mobiliário.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {breakdown.map((entry) => {
              const style = PLATFORM_STYLES[entry.platform];
              const spentShare = percentOf(entry.spent, entry.total);
              return (
                <li key={entry.platform} className="rounded-xl border border-surface-700 bg-surface-850/60 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden="true" />
                      {entry.platform}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(entry.total)}
                    </span>
                  </div>

                  <div
                    className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-700"
                    role="presentation"
                  >
                    <div
                      className={`h-full rounded-full ${style.bar}`}
                      style={{ width: `${spentShare}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                    <span className="text-emerald-400">
                      Gasto {formatCurrency(entry.spent)}
                    </span>
                    <span className="text-amber-400">
                      Previsto {formatCurrency(entry.planned)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
