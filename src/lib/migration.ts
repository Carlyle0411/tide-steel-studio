import { AssetGroup, MediaAsset } from "../types";
import { deleteGroup, getAllAssets, getAllGroups, saveAsset, saveGroup } from "./idb";

export const CORE_GROUPS = [
  { key: "character", name: "角色图" },
  { key: "scene", name: "场景图" },
  { key: "storyboard", name: "故事版" }
] as const;

export type GroupCleanResult = {
  beforeCount: number;
  afterCount: number;
  mergedCount: number;
  migratedAssetRelations: number;
};

export function normalizeGroupName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function mapLegacyGroupNameToCore(name: string): string {
  const text = normalizeGroupName(name);
  if (/角色|主角|人物|阿墨|赤霆|机甲|产品|三视图|表情|设定|服装|道具|角色\/机甲设定|character|protagonist|mecha|product/.test(text)) return "角色图";
  if (/场景|背景|环境|空间|门店|室内|外景|光影|氛围|咖啡馆|试衣镜|驾驶舱环境|scene|background|environment|space/.test(text)) return "场景图";
  if (/分镜|镜头|首帧|尾帧|故事版|storyboard|shot|frame|first frame|last frame|video|clip|可灵|即梦|海螺|生成结果/.test(text)) return "故事版";
  return CORE_GROUPS.some((group) => normalizeGroupName(group.name) === text) ? name.trim() : "故事版";
}

export function uniqueGroupsForProject(groups: AssetGroup[], projectId: string) {
  const projectGroups = groups.filter((group) => group.projectId === projectId);
  const byName = new Map<string, AssetGroup>();
  for (const group of projectGroups) {
    const key = normalizeGroupName(group.name);
    const existing = byName.get(key);
    if (!existing || new Date(group.createdAt).getTime() < new Date(existing.createdAt).getTime()) {
      byName.set(key, group);
    }
  }
  const unique = Array.from(byName.values());
  const core = CORE_GROUPS.map((coreGroup) => unique.find((group) => normalizeGroupName(group.name) === normalizeGroupName(coreGroup.name))).filter(Boolean) as AssetGroup[];
  const custom = unique
    .filter((group) => !CORE_GROUPS.some((coreGroup) => normalizeGroupName(coreGroup.name) === normalizeGroupName(group.name)))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return [...core, ...custom];
}

export async function cleanDuplicateAssetGroups(projectId?: string): Promise<GroupCleanResult> {
  const [allGroups, allAssets] = await Promise.all([getAllGroups(), getAllAssets()]);
  const scopedGroups = projectId ? allGroups.filter((group) => group.projectId === projectId) : allGroups;
  const scopedProjectIds = Array.from(new Set(scopedGroups.map((group) => group.projectId)));
  const beforeCount = scopedGroups.length;
  const now = new Date().toISOString();
  const keepByProjectCore = new Map<string, AssetGroup>();
  const groupIdMap = new Map<string, string>();
  const groupsToDelete = new Set<string>();
  let migratedAssetRelations = 0;

  for (const pid of scopedProjectIds) {
    const projectGroups = allGroups.filter((group) => group.projectId === pid);

    for (const core of CORE_GROUPS) {
      const matchingCore = projectGroups
        .filter((group) => normalizeGroupName(group.name) === normalizeGroupName(core.name))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const keep = matchingCore[0] ?? {
        id: crypto.randomUUID(),
        projectId: pid,
        name: core.name,
        sortOrder: CORE_GROUPS.findIndex((item) => item.name === core.name),
        createdAt: now,
        updatedAt: now
      };
      keepByProjectCore.set(`${pid}:${core.name}`, { ...keep, name: core.name, sortOrder: CORE_GROUPS.findIndex((item) => item.name === core.name), updatedAt: now });
      for (const duplicate of matchingCore.slice(1)) {
        groupIdMap.set(duplicate.id, keep.id);
        groupsToDelete.add(duplicate.id);
      }
    }

    const keepByNormalized = new Map<string, AssetGroup>();
    for (const group of projectGroups) {
      const targetCoreName = mapLegacyGroupNameToCore(group.name);
      if (CORE_GROUPS.some((core) => core.name === targetCoreName) && normalizeGroupName(group.name) !== normalizeGroupName(targetCoreName)) {
        const core = keepByProjectCore.get(`${pid}:${targetCoreName}`)!;
        groupIdMap.set(group.id, core.id);
        groupsToDelete.add(group.id);
        continue;
      }

      const normalized = normalizeGroupName(group.name);
      const existing = keepByNormalized.get(normalized);
      if (!existing || new Date(group.createdAt).getTime() < new Date(existing.createdAt).getTime()) {
        if (existing) {
          groupIdMap.set(existing.id, group.id);
          groupsToDelete.add(existing.id);
        }
        keepByNormalized.set(normalized, group);
      } else {
        groupIdMap.set(group.id, existing.id);
        groupsToDelete.add(group.id);
      }
    }
  }

  const validGroupIds = new Set([
    ...allGroups.filter((group) => !groupsToDelete.has(group.id)).map((group) => group.id),
    ...Array.from(keepByProjectCore.values()).map((group) => group.id)
  ]);

  const updatedAssets: MediaAsset[] = [];
  for (const asset of allAssets) {
    if (projectId && asset.projectId !== projectId) continue;
    const nextIds = asset.groupIds.map((id) => groupIdMap.get(id) ?? id).filter((id) => validGroupIds.has(id));
    if (!nextIds.length) {
      const coreName = mapLegacyGroupNameToCore(`${asset.name} ${asset.tags.join(" ")} ${asset.note} ${asset.usageType}`);
      const core = keepByProjectCore.get(`${asset.projectId}:${coreName}`) ?? keepByProjectCore.get(`${asset.projectId}:故事版`);
      if (core) nextIds.push(core.id);
    }
    const deduped = Array.from(new Set(nextIds));
    if (deduped.join("|") !== asset.groupIds.join("|")) {
      migratedAssetRelations += Math.max(asset.groupIds.length, deduped.length);
      updatedAssets.push({ ...asset, groupIds: deduped, updatedAt: now });
    }
  }

  await Promise.all(Array.from(keepByProjectCore.values()).map(saveGroup));
  await Promise.all(updatedAssets.map(saveAsset));
  await Promise.all(Array.from(groupsToDelete).map(deleteGroup));

  const afterGroups = (await getAllGroups()).filter((group) => !projectId || group.projectId === projectId);
  return {
    beforeCount,
    afterCount: afterGroups.length,
    mergedCount: Math.max(0, beforeCount - afterGroups.length),
    migratedAssetRelations
  };
}
