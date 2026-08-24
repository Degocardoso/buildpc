"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase criado apenas no navegador.
 *
 * As variaveis sao lidas de forma estatica (`process.env.NEXT_PUBLIC_*` inteiro,
 * sem indexacao dinamica) porque o Next.js substitui essas expressoes em build time.
 *
 * Quando as variaveis nao existem, o app continua funcionando 100% em modo local
 * (localStorage) — o build nunca quebra por falta de configuracao.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** `true` quando a sincronizacao na nuvem esta configurada. */
export function isCloudConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;

/** Retorna o cliente compartilhado, ou `null` se a nuvem nao estiver configurada. */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (typeof window === "undefined") return null;

  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}

/** Traduz os erros mais comuns do Supabase Auth para mensagens em portugues. */
export function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  }
  if (normalized.includes("user already registered")) {
    return "Este e-mail já está cadastrado. Faça login.";
  }
  if (normalized.includes("password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (normalized.includes("unable to validate email address")) {
    return "E-mail inválido.";
  }
  if (normalized.includes("email rate limit") || normalized.includes("over_email_send_rate_limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return "Sem conexão com o servidor. Verifique sua internet.";
  }

  return message;
}
