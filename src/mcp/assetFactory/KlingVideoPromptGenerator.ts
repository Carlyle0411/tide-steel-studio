import type { FactoryLibraryItem } from "./AssetLibraryManager";

export function generateKlingPromptFromAsset(asset: FactoryLibraryItem) {
  return [
    `Scene: Tide Steel Soul ${asset.category} production shot`,
    `Subject: ${asset.name}, version ${asset.version}`,
    "Action: subtle cinematic movement preserving original design and identity",
    "Camera Movement: slow push in or controlled tracking, no chaotic handheld unless story requires",
    "Lens: 35mm cinematic lens, realistic depth and scale",
    "Lighting: low-saturation ocean-industrial lighting, cold blue-gray atmosphere",
    "Atmosphere: wet air, sea haze, restrained sci-fi realism",
    "Duration: 5 seconds",
    "Motion Physics: real weight, inertia, water and fabric/mechanical movement obey gravity and drag",
    "Negative Prompt: anime, cartoon, game render, random redesign, face drift, armor drift, rubber motion, fake physics, subtitles, watermark"
  ].join("\n");
}
