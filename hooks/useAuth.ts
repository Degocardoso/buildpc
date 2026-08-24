"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isCloudConfigured, translateAuthError } from "@/lib/supabase";

export interface AuthResult {
  ok: boolean;
  /** Mensagem exibida ao usuario (erro, ou aviso de confirmacao de e-mail). */
  message?: string;
}

export interface UseAuth {
  /** `true` quando as variaveis do Supabase existem neste build. */
  cloudEnabled: boolean;
  user: User | null;
  /** `false` ate a sessao salva ser restaurada — evita piscar a tela de login. */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

/** Sessao do Supabase Auth, restaurada automaticamente a cada carregamento. */
export function useAuth(): UseAuth {
  const cloudEnabled = isCloudConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (!active) return;
        setUser(data.session?.user ?? null);
        setReady(true);
      })
      .catch(() => {
        if (active) setReady(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, message: "Sincronização na nuvem não configurada." };

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return error ? { ok: false, message: translateAuthError(error.message) } : { ok: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, message: "Sincronização na nuvem não configurada." };

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options:
        typeof window !== "undefined" ? { emailRedirectTo: window.location.origin } : undefined,
    });

    if (error) return { ok: false, message: translateAuthError(error.message) };

    // Sem sessao imediata: o projeto exige confirmacao de e-mail.
    if (!data.session) {
      return {
        ok: true,
        message: "Conta criada! Confirme o link enviado para o seu e-mail e faça login.",
      };
    }

    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, message: "Sincronização na nuvem não configurada." };

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    });

    return error
      ? { ok: false, message: translateAuthError(error.message) }
      : { ok: true, message: "Enviamos um link de redefinição para o seu e-mail." };
  }, []);

  return useMemo(
    () => ({ cloudEnabled, user, ready, signIn, signUp, signOut, resetPassword }),
    [cloudEnabled, user, ready, signIn, signUp, signOut, resetPassword],
  );
}
