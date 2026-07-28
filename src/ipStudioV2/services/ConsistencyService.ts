import {
  assertSupabaseRow,
  raiseOnSupabaseError,
  requireAuthenticatedClient,
  toServiceResult,
} from "./serviceClient";

interface CheckFinding {
  checkType: string;
  status: "pass" | "warning" | "fail";
  severity: "info" | "warning" | "error";
  message: string;
  fieldPath?: string;
  recommendation?: string;
}

async function getProjectOrganization(projectId: string): Promise<string> {
  const { client } = await requireAuthenticatedClient();
  const { data, error } = await client
    .from("projects")
    .select("organization_id")
    .eq("id", projectId)
    .single();

  raiseOnSupabaseError(error, "读取项目失败。");
  return assertSupabaseRow(data).organization_id;
}

function checkPromptReferences(prompt: string | null | undefined, referenceCount: number): CheckFinding {
  if (!prompt?.trim()) {
    return {
      checkType: "prompt_required",
      status: "fail",
      severity: "error",
      message: "该镜头缺少 Prompt，不能进入生成任务。",
      fieldPath: "shot.image_prompt",
      recommendation: "补充清晰的画面内容、参考资产和禁止项。",
    };
  }

  if (referenceCount === 0 && /同一人物|同一机甲|参考|Reference/i.test(prompt)) {
    return {
      checkType: "reference_missing",
      status: "warning",
      severity: "warning",
      message: "Prompt 提到了参考资产，但镜头尚未绑定任何资产。",
      fieldPath: "shot_assets",
      recommendation: "先把角色、机甲、场景或母资产绑定到该 Shot。",
    };
  }

  return {
    checkType: "prompt_required",
    status: "pass",
    severity: "info",
    message: "Prompt 已填写。",
  };
}

export const ConsistencyService = {
  runShotCheck: (projectId: string, shotId: string) =>
    toServiceResult(async () => {
      const { client, user } = await requireAuthenticatedClient();
      const organizationId = await getProjectOrganization(projectId);

      const { data: shot, error: shotError } = await client
        .from("shots")
        .select("id, image_prompt, video_prompt, duration_seconds, lens, camera_angle")
        .eq("id", shotId)
        .single();
      raiseOnSupabaseError(shotError, "读取 Shot 失败。");
      const savedShot = assertSupabaseRow(shot);

      const { data: bindings, error: bindingError } = await client
        .from("shot_assets")
        .select("asset_id")
        .eq("shot_id", shotId)
        .is("deleted_at", null);
      raiseOnSupabaseError(bindingError, "读取 Shot 绑定资产失败。");

      const findings: CheckFinding[] = [
        checkPromptReferences(savedShot.image_prompt, bindings?.length ?? 0),
      ];

      if (!savedShot.duration_seconds || Number(savedShot.duration_seconds) <= 0) {
        findings.push({
          checkType: "duration_required",
          status: "warning",
          severity: "warning",
          message: "该镜头缺少明确时长，会影响视频提示词和时间线。",
          fieldPath: "shot.duration_seconds",
          recommendation: "补充镜头时长，例如 5 秒或 15 秒。",
        });
      }

      if (!savedShot.lens && !savedShot.camera_angle) {
        findings.push({
          checkType: "camera_language_required",
          status: "warning",
          severity: "warning",
          message: "该镜头缺少镜头语言，生成画面可能不稳定。",
          fieldPath: "shot.lens",
          recommendation: "补充景别、焦段、机位或运镜。",
        });
      }

      const rows = findings.map((finding) => ({
        organization_id: organizationId,
        project_id: projectId,
        target_type: "shot",
        target_id: shotId,
        check_type: finding.checkType,
        severity: finding.severity,
        status: finding.status,
        message: finding.message,
        field_path: finding.fieldPath ?? null,
        recommendation: finding.recommendation ?? null,
        created_by: user.id,
      }));

      const { error: insertError } = await client.from("consistency_checks").insert(rows);
      raiseOnSupabaseError(insertError, "保存一致性检查失败。");

      return {
        targetType: "shot",
        targetId: shotId,
        findings,
      };
    }),

  listChecks: (projectId: string) =>
    toServiceResult(async () => {
      const { client } = await requireAuthenticatedClient();
      const { data, error } = await client
        .from("consistency_checks")
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      raiseOnSupabaseError(error, "读取一致性检查失败。");
      return data ?? [];
    }),
};
