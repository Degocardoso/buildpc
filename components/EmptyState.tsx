"use client";

import { PackageOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Estado vazio da listagem (sem itens ou sem resultados de filtro). */
export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="rounded-2xl bg-surface-850 p-3.5 text-slate-500">
        <PackageOpen className="h-7 w-7" />
      </span>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="btn-primary mt-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
