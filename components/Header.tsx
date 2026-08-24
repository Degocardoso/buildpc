"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Cloud,
  CloudOff,
  Download,
  Gamepad2,
  LogOut,
  Plus,
  RefreshCw,
  Upload,
  User,
} from "lucide-react";
import type { StorageMode } from "@/types/setup";

interface HeaderProps {
  cloudEnabled: boolean;
  mode: StorageMode;
  userEmail: string | null;
  syncing: boolean;
  onAdd: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

/** Cabecalho fixo: identidade, estado da sincronizacao, backup e acao principal. */
export function Header({
  cloudEnabled,
  mode,
  userEmail,
  syncing,
  onAdd,
  onExport,
  onImport,
  onSignIn,
  onSignOut,
}: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu da conta ao clicar fora ou pressionar ESC.
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onImport(file);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-700/80 bg-surface-950/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400 ring-1 ring-inset ring-brand-500/25">
            <Gamepad2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
              Setup Inventory
            </h1>
            <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
              {syncing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Sincronizando...
                </>
              ) : mode === "cloud" ? (
                <>
                  <Cloud className="h-3 w-3 text-emerald-500" />
                  <span className="truncate">Sincronizado — {userEmail}</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-3 w-3" />
                  Salvo neste navegador
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-ghost !px-2.5 sm:!px-3.5"
            title="Importar backup (.json)"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden lg:inline">Importar</span>
          </button>
          <button
            type="button"
            onClick={onExport}
            className="btn-ghost !px-2.5 sm:!px-3.5"
            title="Exportar backup (.json)"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline">Exportar</span>
          </button>

          {cloudEnabled ? (
            mode === "cloud" ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="btn-ghost !px-2.5"
                  title="Minha conta"
                >
                  <User className="h-4 w-4" />
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-60 animate-fade-in rounded-xl border border-surface-700 bg-surface-900 p-1.5 shadow-2xl"
                  >
                    <p className="truncate px-2.5 py-2 text-xs text-slate-400" title={userEmail ?? ""}>
                      {userEmail}
                    </p>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        onSignOut();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-300 transition hover:bg-surface-800 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair da conta
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="btn-ghost !px-2.5 sm:!px-3.5"
                title="Entrar para sincronizar"
              >
                <Cloud className="h-4 w-4" />
                <span className="hidden lg:inline">Entrar</span>
              </button>
            )
          ) : null}

          <button
            type="button"
            onClick={onAdd}
            className="btn-primary !px-2.5 sm:!px-3.5"
            title="Novo item"
            aria-label="Novo item"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo item</span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}
