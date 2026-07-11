import library from "../../../projects/tide-steel-soul/kling-video-template-library/VIDEO_TEMPLATE_LIBRARY.json";

export type KlingVideoTemplate = (typeof library.templates)[number];

export function getKlingVideoTemplateLibrary() {
  return library;
}

export function getKlingVideoTemplates(): KlingVideoTemplate[] {
  return library.templates;
}

export function getKlingVideoTemplateCategories() {
  return library.categories;
}

export function searchKlingVideoTemplates(query: string, category = "全部") {
  const q = query.trim().toLowerCase();
  return library.templates.filter((template) => {
    const categoryOk = category === "全部" || template.category === category;
    const text = [template.id, template.name, template.category, template.motion, template.cameraMovement, template.atmosphere, template.klingPrompt, ...template.tags].join(" ").toLowerCase();
    return categoryOk && (!q || text.includes(q));
  });
}

export function getKlingVideoTemplateStats() {
  return {
    total: library.total,
    categories: library.categories.length,
    human: library.categories.find((item) => item.name === "人物动作")?.count ?? 0,
    mecha: library.categories.find((item) => item.name === "机甲动作")?.count ?? 0,
    creature: library.categories.find((item) => item.name === "怪兽动作")?.count ?? 0,
    environment: library.categories.find((item) => item.name === "环境运动")?.count ?? 0,
    camera: library.categories.find((item) => item.name === "镜头运动")?.count ?? 0
  };
}
