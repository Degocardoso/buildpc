"use client";

import { TriangleAlert } from "lucide-react";
import { Modal } from "@/components/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Dialogo de confirmacao para acoes destrutivas (excluir item, limpar tudo). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Excluir",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} size="md" title={title} onClose={onCancel}>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-rose-500/15 p-2 text-rose-400">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <p className="text-sm leading-relaxed text-slate-300">{message}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-surface-700 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger">
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
