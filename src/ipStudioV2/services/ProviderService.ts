import { assertSupabaseRow, raiseOnSupabaseError, requireAuthenticatedClient, toServiceResult } from "./serviceClient";

export interface UpsertProviderInput {
  projectId?: string | null;
  organizationId?: string | null;
  providerKey: string;
  displayName: string;
  providerType: string;
  status?: "not_configured" | "configured" | "disabled";
  config?: Record<string, unknown>;
}

export const ProviderService = {
  listProviders: (projectId?: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      let query = client
        .from("model_providers")
        .select("*")
        .is("deleted_at", null)
        .order("display_name", { ascending: true });

      if (projectId) {
        query = query.or(`project_id.eq.${projectId},project_id.is.null`);
      }

      const { data, error } = await query;
      raiseOnSupabaseError(error, "读取模型服务配置失败。");
      return data ?? [];
    }),

  upsertProvider: (input: UpsertProviderInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      let lookup = client
        .from("model_providers")
        .select("id")
        .eq("provider_key", input.providerKey)
        .is("deleted_at", null)
        .limit(1);

      lookup = input.projectId ? lookup.eq("project_id", input.projectId) : lookup.is("project_id", null);
      lookup = input.organizationId ? lookup.eq("organization_id", input.organizationId) : lookup.is("organization_id", null);

      const { data: existing, error: lookupError } = await lookup.maybeSingle();
      raiseOnSupabaseError(lookupError, "读取模型服务配置失败。");

      const payload = {
            organization_id: input.organizationId ?? null,
            project_id: input.projectId ?? null,
            provider_key: input.providerKey,
            display_name: input.displayName,
            provider_type: input.providerType,
            status: input.status ?? "not_configured",
            config: input.config ?? {},
            created_by: user.id,
            updated_at: new Date().toISOString(),
      };

      const request = existing?.id
        ? client.from("model_providers").update(payload).eq("id", existing.id)
        : client.from("model_providers").insert(payload);

      const { data, error } = await request.select("*").single();

      raiseOnSupabaseError(error, "保存模型服务配置失败。");
      return assertSupabaseRow(data);
    }),
};
