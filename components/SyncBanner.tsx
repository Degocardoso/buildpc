"use client";

import { CloudUpload, HardDrive, Loader2, X } from "lucide-react";
import type { StorageMode } from "@/types/setup";

interface SyncBannerProps {
  cloudEnabled: boolean;
  mode: StorageMode;
  /** Itens salvos no navegador que ainda nao existem na conta da nuvem. */
  pendingLocalCount: number;
  uploading: boolean;
  onSignIn: () => void;
  onUpload: () => void;
  onDismiss: () => void;
}

/**
 * Faixa contextual abaixo do cabecalho:
 * - modo local com nuvem disponivel -> convida a entrar para sincronizar;
 * - modo nuvem com itens locais pendentes -> oferece enviar esses itens.
 */
export function SyncBanner({
  cloudEnabled,
  mode,
  pendingLocalCount,
  uploading,
  onSignIn,
  onUpload,
  onDismiss,
}: SyncBannerProps) {
  if (!cloudEnabled) return null;

  if (mode === "cloud") {
    if (pendingLocalCount === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-3">
        <CloudUpload className="h-4 w-4 shrink-0 text-brand-400" />
        <p className="flex-1 text-sm text-slate-200">
          Você tem{" "}
          <strong className="font-semibold text-white">
            {pendingLocalCount} {pendingLocalCount === 1 ? "item" : "itens"}
          </strong>{" "}
          salvos só neste navegador. Quer enviá-los para a sua conta?
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onUpload} className="btn-primary !py-1.5 text-xs" disabled={uploading}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CloudUpload className="h-3.5 w-3.5" />}
            Enviar para a nuvem
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dispensar aviso"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-surface-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-700 bg-surface-900/80 px-4 py-3">
      <HardDrive className="h-4 w-4 shrink-0 text-slate-500" />
      <p className="flex-1 text-sm text-slate-300">
        Seus dados estão salvos <strong className="font-semibold text-white">só neste navegador</strong>.
        Entre com sua conta para ver o setup de qualquer lugar.
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onSignIn} className="btn-primary !py-1.5 text-xs">
          Entrar / criar conta
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dispensar aviso"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-surface-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
