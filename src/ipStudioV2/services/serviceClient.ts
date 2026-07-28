import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../../lib/supabaseClient";
import type { ServiceErrorCode, ServiceResult } from "../types";

export class IPStudioServiceError extends Error {
  code: ServiceErrorCode;
  details?: unknown;

  constructor(code: ServiceErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "IPStudioServiceError";
    this.code = code;
    this.details = details;
  }
}

export interface AuthenticatedClient {
  client: SupabaseClient;
  user: User;
}

export function requireSupabaseClient(): SupabaseClient {
  if (!supabaseConfigured || !supabase) {
    throw new IPStudioServiceError(
      "UNCONFIGURED",
      "Supabase 未配置。请先配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。"
    );
  }

  return supabase as SupabaseClient;
}

export async function requireAuthenticatedClient(): Promise<AuthenticatedClient> {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw new IPStudioServiceError("AUTH_REQUIRED", "无法读取当前登录用户。", error);
  }

  if (!data.user) {
    throw new IPStudioServiceError("AUTH_REQUIRED", "请先登录后再操作。");
  }

  return { client, user: data.user };
}

export function toServiceResult<T>(callback: () => Promise<T>): Promise<ServiceResult<T>> {
  return callback()
    .then((data) => ({ data, error: null }))
    .catch((error: unknown) => {
      if (error instanceof IPStudioServiceError) {
        return {
          data: null,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        data: null,
        error: {
          code: "DATABASE_ERROR" as const,
          message: error instanceof Error ? error.message : "未知数据库错误。",
          details: error,
        },
      };
    });
}

export function assertSupabaseRow<T>(row: T | null, message = "记录不存在。"): T {
  if (!row) {
    throw new IPStudioServiceError("NOT_FOUND", message);
  }

  return row;
}

export function raiseOnSupabaseError(error: unknown, message: string): void {
  if (error) {
    throw new IPStudioServiceError("DATABASE_ERROR", message, error);
  }
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function nextVersionLabel(count: number): string {
  return `V${String(count + 1).padStart(3, "0")}`;
}
