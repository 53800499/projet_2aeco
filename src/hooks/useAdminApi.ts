"use client";

import { useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ProfileRecord } from "@/lib/profile";
import { AdminDashboardStats, AdminUserRow, UserListStatus } from "@/lib/admin-users";
import { PlaquetteMember } from "@/lib/plaquette";
import { BlogPost } from "@/lib/blogs";

const getAccessToken = async () => {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

const adminFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = await getAccessToken();
  if (!token) throw new Error("Connectez-vous pour accéder au backoffice.");

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Requête administrateur échouée.");
  }
  return data as T;
};

export const useAdminApi = () => {
  const fetchStats = useCallback(
    () => adminFetch<AdminDashboardStats>("/api/admin/stats"),
    []
  );

  const fetchUsers = useCallback(
    (params: {
      search?: string;
      page?: number;
      limit?: number;
      status?: UserListStatus;
    }) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set("search", params.search);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.status) qs.set("status", params.status);
      return adminFetch<{
        users: AdminUserRow[];
        total: number;
        page: number;
        limit: number;
      }>(`/api/admin/users?${qs.toString()}`);
    },
    []
  );

  const fetchUser = useCallback(
    (id: string) =>
      adminFetch<{ profile: ProfileRecord }>(`/api/admin/users/${id}`),
    []
  );

  const createUser = useCallback(
    (input: {
      email: string;
      password: string;
      full_name: string;
      phone?: string;
      promo?: string;
      role?: string;
    }) =>
      adminFetch<{ profile: ProfileRecord }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    []
  );

  const updateUser = useCallback(
    (id: string, profile: ProfileRecord & { role?: string; visible_in_plaquette?: boolean }) =>
      adminFetch<{ profile: ProfileRecord }>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(profile),
      }),
    []
  );

  const softDeleteUser = useCallback(
    (id: string) =>
      adminFetch<{ success: boolean; softDeleted: boolean }>(`/api/admin/users/${id}`, {
        method: "DELETE",
      }),
    []
  );

  const restoreUser = useCallback(
    (id: string) =>
      adminFetch<{ profile: ProfileRecord; restored: boolean }>(
        `/api/admin/users/${id}/restore`,
        { method: "POST" }
      ),
    []
  );

  const fetchBlogs = useCallback(
    () => adminFetch<{ blogs: BlogPost[] }>("/api/admin/blogs"),
    []
  );

  const createBlog = useCallback(
    (input: Partial<BlogPost>) =>
      adminFetch<{ blog: BlogPost }>("/api/admin/blogs", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    []
  );

  const updateBlog = useCallback(
    (id: string, input: Partial<BlogPost>) =>
      adminFetch<{ blog: BlogPost }>(`/api/admin/blogs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    []
  );

  const deleteBlog = useCallback(
    (id: string) =>
      adminFetch<{ success: boolean }>(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      }),
    []
  );

  return {
    fetchStats,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    softDeleteUser,
    restoreUser,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  };
};

export const useIsAdmin = (profile: { role?: string; email?: string } | null) => {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (profile.email && adminEmails.includes(profile.email.toLowerCase())) return true;
  return false;
};

export type { PlaquetteMember, AdminDashboardStats, AdminUserRow, UserListStatus, BlogPost };
