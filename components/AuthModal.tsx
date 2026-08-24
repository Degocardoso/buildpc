"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Cloud, Loader2, LogIn, UserPlus } from "lucide-react";
import { Modal } from "@/components/Modal";

type AuthMode = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  onSignUp: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  onResetPassword: (email: string) => Promise<{ ok: boolean; message?: string }>;
}

/** Login e cadastro por e-mail e senha (Supabase Auth). */
export function AuthModal({
  open,
  onClose,
  onSignIn,
  onSignUp,
  onResetPassword,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode("signin");
    setEmail("");
    setPassword("");
    setFeedback(null);
    setBusy(false);
  }, [open]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!email.trim()) {
      setFeedback({ tone: "error", text: "Informe o seu e-mail." });
      return;
    }
    if (password.length < 6) {
      setFeedback({ tone: "error", text: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setBusy(true);
    const result = mode === "signin" ? await onSignIn(email, password) : await onSignUp(email, password);
    setBusy(false);

    if (!result.ok) {
      setFeedback({ tone: "error", text: result.message ?? "Não foi possível continuar." });
      return;
    }

    // Cadastro que exige confirmacao de e-mail: mantem o modal aberto com o aviso.
    if (result.message) {
      setFeedback({ tone: "info", text: result.message });
      setMode("signin");
      setPassword("");
      return;
    }

    onClose();
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setFeedback({ tone: "error", text: "Digite seu e-mail para receber o link de redefinição." });
      return;
    }

    setBusy(true);
    const result = await onResetPassword(email);
    setBusy(false);
    setFeedback({
      tone: result.ok ? "info" : "error",
      text: result.message ?? "Não foi possível enviar o e-mail.",
    });
  }

  return (
    <Modal
      open={open}
      size="md"
      title={mode === "signin" ? "Entrar na sua conta" : "Criar conta"}
      description="Acesse o seu setup de qualquer dispositivo."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-brand-500/25 bg-brand-500/10 px-3.5 py-3">
          <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
          <p className="text-xs leading-relaxed text-slate-300">
            Com uma conta, seu inventário fica salvo na nuvem e sincroniza entre celular,
            notebook e qualquer outro navegador.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["signin", "signup"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchMode(option)}
              aria-pressed={mode === option}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                mode === option
                  ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                  : "border-surface-600 bg-surface-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              {option === "signin" ? "Já tenho conta" : "Criar conta"}
            </button>
          ))}
        </div>

        <div>
          <label className="label" htmlFor="auth-email">
            E-mail
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            className="field"
          />
        </div>

        <div>
          <label className="label" htmlFor="auth-password">
            Senha
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo de 6 caracteres"
            className="field"
          />
          {mode === "signin" ? (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={busy}
              className="mt-2 text-xs text-slate-400 underline-offset-2 transition hover:text-white hover:underline disabled:opacity-50"
            >
              Esqueci minha senha
            </button>
          ) : null}
        </div>

        {feedback ? (
          <p
            role="alert"
            className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${
              feedback.tone === "error"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {feedback.text}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-surface-700 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={busy}>
            Agora não
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
