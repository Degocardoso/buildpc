"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShoppingCart } from "lucide-react";
import type { SetupItem } from "@/types/setup";
import { formatCurrency, parseCurrencyInput, todayISO } from "@/lib/format";
import { Modal } from "@/components/Modal";

interface PurchaseModalProps {
  /** Item da wishlist sendo convertido, ou `null` quando fechado. */
  item: SetupItem | null;
  onClose: () => void;
  onConfirm: (id: string, pricePaid: number, purchaseDate: string) => void;
}

/**
 * Confirmacao do botao "Comprei este item!":
 * pede o valor final pago e a data exata da compra antes de mover para o inventario.
 */
export function PurchaseModal({ item, onClose, onConfirm }: PurchaseModalProps) {
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(todayISO());
  const [errors, setErrors] = useState<{ price?: string; date?: string }>({});

  useEffect(() => {
    if (!item) return;
    const estimated = item.estimatedPrice ?? 0;
    setPrice(estimated > 0 ? String(estimated).replace(".", ",") : "");
    setDate(todayISO());
    setErrors({});
  }, [item]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;

    const pricePaid = parseCurrencyInput(price);
    const nextErrors: { price?: string; date?: string } = {};

    if (!price.trim() || pricePaid <= 0) nextErrors.price = "Informe o valor pago.";
    if (!date) nextErrors.date = "Informe a data da compra.";
    else if (date > todayISO()) nextErrors.date = "A data não pode estar no futuro.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onConfirm(item.id, pricePaid, date);
  }

  const estimated = item?.estimatedPrice ?? 0;
  const paid = parseCurrencyInput(price);
  const difference = paid > 0 && estimated > 0 ? paid - estimated : 0;

  return (
    <Modal
      open={item !== null}
      size="md"
      title="Confirmar compra"
      description={item ? `Mover "${item.name}" para o seu inventário.` : undefined}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="label" htmlFor="purchase-price">
            Valor pago (R$) *
          </label>
          <input
            id="purchase-price"
            inputMode="decimal"
            value={price}
            onChange={(event) => {
              setPrice(event.target.value);
              setErrors((current) => ({ ...current, price: undefined }));
            }}
            placeholder="0,00"
            className="field"
            autoFocus
          />
          {errors.price ? (
            <p className="mt-1 text-xs text-rose-400">{errors.price}</p>
          ) : estimated > 0 ? (
            <p className="mt-1 text-xs text-slate-500">
              Estimado: {formatCurrency(estimated)}
              {difference !== 0 ? (
                <span className={difference < 0 ? " text-emerald-400" : " text-rose-400"}>
                  {" · "}
                  {difference < 0 ? "economia de " : "acima em "}
                  {formatCurrency(Math.abs(difference))}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="purchase-date">
            Data da compra *
          </label>
          <input
            id="purchase-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(event) => {
              setDate(event.target.value);
              setErrors((current) => ({ ...current, date: undefined }));
            }}
            className="field"
          />
          {errors.date ? <p className="mt-1 text-xs text-rose-400">{errors.date}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-surface-700 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            <ShoppingCart className="h-4 w-4" />
            Confirmar compra
          </button>
        </div>
      </form>
    </Modal>
  );
}
