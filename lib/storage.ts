import type { BackupFile, Category, ItemStatus, Platform, Priority, SetupItem } from "@/types/setup";
import { CATEGORIES, PLATFORMS } from "@/types/setup";
import { STORAGE_KEY } from "@/lib/constants";

/** Gera um id unico. Usa `crypto.randomUUID` quando disponivel. */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
  }
  return undefined;
}

function asPlatform(value: unknown): Platform {
  return PLATFORMS.find((platform) => platform === value) ?? "PC";
}

function asCategory(value: unknown): Category {
  return CATEGORIES.find((category) => category === value) ?? "Outros";
}

function asStatus(value: unknown): ItemStatus {
  return value === "wishlist" ? "wishlist" : "owned";
}

function asPriority(value: unknown): Priority | undefined {
  return value === "alta" || value === "media" || value === "baixa" ? value : undefined;
}

/** Normaliza datas para `YYYY-MM-DD`, aceitando tambem ISO completo. */
function asISODate(value: unknown): string | undefined {
  const raw = asString(value);
  if (!raw) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  return match ? match[0] : undefined;
}

/**
 * Converte um valor desconhecido (vindo do localStorage ou de um backup importado)
 * em um `SetupItem` valido. Retorna `null` quando o registro e irrecuperavel.
 */
export function sanitizeItem(value: unknown): SetupItem | null {
  if (!isRecord(value)) return null;

  const name = asString(value.name);
  if (!name) return null;

  const status = asStatus(value.status);
  const now = new Date().toISOString();

  const item: SetupItem = {
    id: asString(value.id) ?? createId(),
    name,
    platform: asPlatform(value.platform),
    category: asCategory(value.category),
    status,
    imageUrl: asString(value.imageUrl),
    notes: asString(value.notes),
    createdAt: asString(value.createdAt) ?? now,
    updatedAt: asString(value.updatedAt) ?? now,
  };

  if (status === "owned") {
    item.pricePaid = asNumber(value.pricePaid) ?? asNumber(value.estimatedPrice) ?? 0;
    item.purchaseDate = asISODate(value.purchaseDate);
  } else {
    item.estimatedPrice = asNumber(value.estimatedPrice) ?? asNumber(value.pricePaid) ?? 0;
    item.priority = asPriority(value.priority) ?? "media";
    item.productUrl = asString(value.productUrl);
  }

  return item;
}

function sanitizeItems(value: unknown): SetupItem[] {
  if (!Array.isArray(value)) return [];
  const items: SetupItem[] = [];
  const seen = new Set<string>();

  for (const raw of value) {
    const item = sanitizeItem(raw);
    if (!item) continue;
    if (seen.has(item.id)) item.id = createId();
    seen.add(item.id);
    items.push(item);
  }

  return items;
}

/**
 * Le os itens do localStorage.
 * Sempre chamado dentro de `useEffect`, portanto nunca executa durante o SSR,
 * mas ainda assim protege contra ambientes sem `window` e contra storage bloqueado.
 */
export function loadItems(): SetupItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitizeItems(JSON.parse(raw));
  } catch (error) {
    console.error("[buildpc] Falha ao ler o inventário salvo:", error);
    return [];
  }
}

/** Persiste os itens no localStorage. Retorna `false` se o storage recusar a escrita. */
export function saveItems(items: SetupItem[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("[buildpc] Falha ao salvar o inventário:", error);
    return false;
  }
}

/** Monta o objeto de backup exportado como `.json`. */
export function buildBackup(items: SetupItem[]): BackupFile {
  return {
    app: "setup-inventory",
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  };
}

/**
 * Interpreta o conteudo de um arquivo de backup.
 * Aceita tanto o envelope `BackupFile` quanto um array puro de itens.
 */
export function parseBackup(content: string): SetupItem[] {
  const parsed: unknown = JSON.parse(content);
  if (Array.isArray(parsed)) return sanitizeItems(parsed);
  if (isRecord(parsed) && Array.isArray(parsed.items)) return sanitizeItems(parsed.items);
  throw new Error("Arquivo de backup inválido: nenhum item encontrado.");
}

/** Dispara o download de um arquivo `.json` no navegador. */
export function downloadJSON(data: unknown, filename: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Le um arquivo local e devolve o conteudo como data URI Base64. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Não foi possível ler o arquivo selecionado."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha na leitura do arquivo."));
    reader.readAsDataURL(file);
  });
}
