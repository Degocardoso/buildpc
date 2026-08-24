"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** Largura maxima do painel. */
  size?: "md" | "lg";
}

/** Modal acessivel: fecha com ESC ou clique no backdrop e trava o scroll do body. */
export function Modal({ open, title, description, onClose, children, size = "lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
      <div
        className="fixed inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 my-0 w-full animate-slide-up rounded-t-2xl border border-surface-700 bg-surface-900 shadow-2xl sm:my-8 sm:rounded-2xl ${
          size === "md" ? "sm:max-w-md" : "sm:max-w-2xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-surface-700 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-slate-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-surface-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-5 scrollbar-thin sm:max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
