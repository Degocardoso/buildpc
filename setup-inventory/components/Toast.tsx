"use client";

import { useEffect } from "react";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  text: string;
  tone: "success" | "error";
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

/** Notificacao efemera no canto inferior direito (auto-dismiss em 4s). */
export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const success = toast.tone === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[60] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 animate-slide-up sm:left-auto sm:right-4 sm:translate-x-0"
    >
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur ${
          success
            ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-100"
            : "border-rose-500/30 bg-rose-950/90 text-rose-100"
        }`}
      >
        {success ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        ) : (
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
        )}
        <p className="flex-1 text-sm leading-snug">{toast.text}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar notificação"
          className="rounded p-0.5 opacity-70 transition hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
