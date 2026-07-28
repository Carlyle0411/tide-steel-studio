import type { CreateProjectInput, IPStudioProject } from "../types";
import {
  IPStudioServiceError,
  assertSupabaseRow,
  normalizeSlug,
  raiseOnSupabaseError,
  requireAuthenticatedClient,
  toServiceResult,
} from "./serviceClient";

interface WorkspaceBootstrap {
  organizationId: string;
}

async function ensurePersonalWorkspace(): Promise<WorkspaceBootstrap> {
  const { client, user } = await requireAuthenticatedClient();

  const { data: existingMember, error: memberError } = await client
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  raiseOnSupabaseError(memberError, "读取个人工作空间失败。");

  if (existingMember?.organization_id) {
    return { organizationId: existingMember.organization_id };
  }

  const fallbackName = user.email ? `${user.email} 的个人工作空间` : "个人工作空间";
  const { data: organization, error: organizationError } = await client
    .from("organizations")
    .insert({
      name: fallbackName,
      owner_id: user.id,
      plan: "personal",
    })
    .select("id")
    .single();

  raiseOnSupabaseError(organizationError, "创建个人工作空间失败。");

  const organizationId = assertSupabaseRow(organization).id;

  const { error: profileError } = await client.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    display_name: user.user_metadata?.name ?? user.email ?? null,
    default_organization_id: organizationId,
  });
  raiseOnSupabaseError(profileError, "保存用户资料失败。");

  const { error: memberInsertError } = await client.from("organization_members").insert({
    organization_id: organizationId,
    user_id: user.id,
    role: "owner",
    status: "active",
  });
  raiseOnSupabaseError(memberInsertError, "创建工作空间成员关系失败。");

  return { organizationId };
}

export const ProjectService = {
  ensurePersonalWorkspace: () => toServiceResult(ensurePersonalWorkspace),

  listProjects: () =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("projects")
        .select("*")
        .is("deleted_at", null)
        .neq("status", "deleted")
        .order("updated_at", { ascending: false });

      raiseOnSupabaseError(error, "读取项目列表失败。");
      return (data ?? []) as IPStudioProject[];
    }),

  createProject: (input: CreateProjectInput) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      if (!input.name.trim()) {
        throw new IPStudioServiceError("VALIDATION_ERROR", "项目名称不能为空。");
      }

      const { organizationId } = await ensurePersonalWorkspace();
      const slug = input.slug ? normalizeSlug(input.slug) : normalizeSlug(input.name);

      const { data: project, error: projectError } = await client
        .from("projects")
        .insert({
          organization_id: organizationId,
          owner_id: user.id,
          name: input.name.trim(),
          slug,
          cover_url: input.coverUrl ?? null,
          project_type: input.projectType ?? "ai_film",
          target_platform: input.targetPlatform ?? null,
          aspect_ratio: input.aspectRatio ?? "16:9",
          content_style: input.contentStyle ?? null,
          description: input.description ?? null,
          visual_standard: input.visualStandard ?? {},
          created_by: user.id,
        })
        .select("*")
        .single();

      raiseOnSupabaseError(projectError, "创建项目失败。");

      const savedProject = assertSupabaseRow(project) as IPStudioProject;

      const { error: memberError } = await client.from("project_members").insert({
        project_id: savedProject.id,
        user_id: user.id,
        role: "owner",
        status: "active",
      });
      raiseOnSupabaseError(memberError, "创建项目成员关系失败。");

      const { error: bibleError } = await client.from("ip_bibles").insert({
        organization_id: organizationId,
        project_id: savedProject.id,
        raw_markdown: `# ${savedProject.name}\n\n## 世界观\n\n## 视觉规则\n\n## 角色规则\n\n## 禁止项\n`,
        created_by: user.id,
      });
      raiseOnSupabaseError(bibleError, "创建项目 IP 圣经失败。");

      return savedProject;
    }),

  updateProject: (projectId: string, patch: Partial<CreateProjectInput & { status: string; favorite: boolean }>) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (patch.name !== undefined) updatePayload.name = patch.name.trim();
      if (patch.slug !== undefined) updatePayload.slug = normalizeSlug(patch.slug);
      if (patch.coverUrl !== undefined) updatePayload.cover_url = patch.coverUrl;
      if (patch.projectType !== undefined) updatePayload.project_type = patch.projectType;
      if (patch.targetPlatform !== undefined) updatePayload.target_platform = patch.targetPlatform;
      if (patch.aspectRatio !== undefined) updatePayload.aspect_ratio = patch.aspectRatio;
      if (patch.contentStyle !== undefined) updatePayload.content_style = patch.contentStyle;
      if (patch.description !== undefined) updatePayload.description = patch.description;
      if (patch.visualStandard !== undefined) updatePayload.visual_standard = patch.visualStandard;
      if (patch.status !== undefined) updatePayload.status = patch.status;
      if (patch.favorite !== undefined) updatePayload.favorite = patch.favorite;

      const { data, error } = await client
        .from("projects")
        .update(updatePayload)
        .eq("id", projectId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "更新项目失败。");
      return assertSupabaseRow(data) as IPStudioProject;
    }),

  archiveProject: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("projects")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "归档项目失败。");
      return assertSupabaseRow(data) as IPStudioProject;
    }),

  softDeleteProject: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("projects")
        .update({
          status: "deleted",
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .select("*")
        .single();

      raiseOnSupabaseError(error, "删除项目失败。");
      return assertSupabaseRow(data) as IPStudioProject;
    }),
};
