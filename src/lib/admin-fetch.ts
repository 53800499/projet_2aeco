"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";

type CacheEntry<T> = { data: T; expiresAt: number };

const GET_CACHE_TTL_MS = 30_000;
const getCache = new Map<string, CacheEntry<unknown>>();

let tokenCache: { token: string; expiresAt: number } | null = null;

export const getAdminAccessToken = async (): Promise<string> => {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Connectez-vous pour accéder au backoffice.");

  const expiresAt = data.session?.expires_at
    ? data.session.expires_at * 1000 - 60_000
    : now + 5 * 60_000;

  tokenCache = { token, expiresAt };
  return token;
};

export const clearAdminFetchCache = () => {
  getCache.clear();
  tokenCache = null;
};

export const adminFetch = async <T>(
  path: string,
  init?: RequestInit & { cacheTtlMs?: number }
): Promise<T> => {
  const method = (init?.method || "GET").toUpperCase();
  const isGet = method === "GET";
  const ttl = init?.cacheTtlMs ?? (isGet ? GET_CACHE_TTL_MS : 0);
  const cacheKey = isGet && ttl > 0 ? `${method}:${path}` : null;

  if (cacheKey) {
    const hit = getCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (hit && hit.expiresAt > Date.now()) return hit.data;
  }

  const token = await getAdminAccessToken();
  const { cacheTtlMs: _ttl, ...fetchInit } = init || {};

  const response = await fetch(path, {
    ...fetchInit,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(fetchInit.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Requête administrateur échouée.");
  }

  if (cacheKey && ttl > 0) {
    getCache.set(cacheKey, { data: data as T, expiresAt: Date.now() + ttl });
  }

  return data as T;
};

export const invalidateAdminGetCache = (pathPrefix?: string) => {
  if (!pathPrefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.includes(pathPrefix)) getCache.delete(key);
  }
};
