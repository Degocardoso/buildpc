/** Utilitarios de formatacao (BRL e datas DD/MM/AAAA) sem dependencias externas. */

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formata um numero como moeda brasileira: `1234.5` -> `R$ 1.234,50`. */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Versao compacta para cartoes estreitos: `12345` -> `R$ 12,3 mil`. */
export function formatCurrencyCompact(value: number): string {
  return compactCurrencyFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Converte texto digitado pelo usuario em numero.
 * Aceita `1.234,56`, `1234,56`, `1234.56` e `R$ 1.234,56`.
 */
export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized: string;

  if (lastComma > lastDot) {
    // Virgula e o separador decimal: remove os pontos de milhar.
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    // Ponto e o separador decimal: remove as virgulas de milhar.
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(/[.,]/g, "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Formata uma data ISO `YYYY-MM-DD` como `DD/MM/AAAA`.
 * A conversao e feita por string para nao sofrer deslocamento de fuso horario.
 */
export function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return "—";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Formata uma data ISO como `12 de março de 2025`. */
export function formatDateLong(isoDate: string | undefined): string {
  if (!isoDate) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return "—";
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Data de hoje no formato `YYYY-MM-DD`, respeitando o fuso local. */
export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Percentual seguro (evita divisao por zero). */
export function percentOf(value: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}
