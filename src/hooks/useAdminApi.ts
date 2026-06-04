"use client";

import { useCallback } from "react";
import { adminFetch, clearAdminFetchCache, invalidateAdminGetCache } from "@/lib/admin-fetch";
import { ProfileRecord } from "@/lib/profile";
import { AdminDashboardStats, AdminUserRow, UserListStatus } from "@/lib/admin-users";
import { PlaquetteMember } from "@/lib/plaquette";
import { BlogPost } from "@/lib/blogs";

export const useAdminApi = () => {
  const fetchStats = useCallback(
    () => adminFetch<AdminDashboardStats>("/api/admin/stats", { cacheTtlMs: 30_000 }),
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
      const path = `/api/admin/users?${qs.toString()}`;
      return adminFetch<{
        users: AdminUserRow[];
        total: number;
        page: number;
        limit: number;
      }>(path, { cacheTtlMs: 15_000 });
    },
    []
  );

  const fetchUser = useCallback(
    (id: string) =>
      adminFetch<{ profile: ProfileRecord }>(`/api/admin/users/${id}`, { cacheTtlMs: 10_000 }),
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
    }) => {
      invalidateAdminGetCache("/api/admin");
      return adminFetch<{ profile: ProfileRecord }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(input),
        cacheTtlMs: 0,
      });
    },
    []
  );

  const updateUser = useCallback(
    (id: string, profile: ProfileRecord & { role?: string; visible_in_plaquette?: boolean }) => {
      invalidateAdminGetCache("/api/admin");
      return adminFetch<{ profile: ProfileRecord }>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(profile),
        cacheTtlMs: 0,
      });
    },
    []
  );

  const softDeleteUser = useCallback(
    (id: string) => {
      invalidateAdminGetCache("/api/admin");
      return adminFetch<{ success: boolean; softDeleted: boolean }>(`/api/admin/users/${id}`, {
        method: "DELETE",
        cacheTtlMs: 0,
      });
    },
    []
  );

  const restoreUser = useCallback(
    (id: string) => {
      invalidateAdminGetCache("/api/admin");
      return adminFetch<{ profile: ProfileRecord; restored: boolean }>(
        `/api/admin/users/${id}/restore`,
        { method: "POST", cacheTtlMs: 0 }
      );
    },
    []
  );

  const fetchBlogs = useCallback(
    () => adminFetch<{ blogs: BlogPost[] }>("/api/admin/blogs", { cacheTtlMs: 20_000 }),
    []
  );

  const createBlog = useCallback(
    (input: Partial<BlogPost>) => {
      invalidateAdminGetCache("/api/admin/blogs");
      return adminFetch<{ blog: BlogPost }>("/api/admin/blogs", {
        method: "POST",
        body: JSON.stringify(input),
        cacheTtlMs: 0,
      });
    },
    []
  );

  const updateBlog = useCallback(
    (id: string, input: Partial<BlogPost>) => {
      invalidateAdminGetCache("/api/admin/blogs");
      return adminFetch<{ blog: BlogPost }>(`/api/admin/blogs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
        cacheTtlMs: 0,
      });
    },
    []
  );

  const deleteBlog = useCallback(
    (id: string) => {
      invalidateAdminGetCache("/api/admin/blogs");
      return adminFetch<{ success: boolean }>(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        cacheTtlMs: 0,
      });
    },
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
    clearCache: clearAdminFetchCache,
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
