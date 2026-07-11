import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const assetRoot = join(process.cwd(), "projects", "tide-steel-soul", "assets");
const manifestPath = join(assetRoot, "asset-library.json");

const promptMap = new Map([
  ["mechas/chiting01/front.png", ["CRT-001 Front Design", "mechas", "CRT-001 Chiting-01 front design, heavy industrial humanoid mech, deep crimson armor, black mechanical skeleton, blue energy reactor, 20 meters scale, wet metal, salt corrosion, restrained film concept art, not anime, not game render."]],
  ["mechas/chiting01/side.png", ["CRT-001 Side Design", "mechas", "CRT-001 Chiting-01 side design, heavy industrial silhouette, deep crimson armor plates, black inner frame, blue synchronized energy lines, humid Hangzhou Bay hangar light, practical engineering mass, no hero pose."]],
  ["mechas/chiting01/back.png", ["CRT-001 Back Design", "mechas", "CRT-001 Chiting-01 back design, hidden rear cockpit entrance, shoulder armor and back plating, deep crimson worn armor, black hydraulic frame, blue warning sync light, wet metal and maintenance scars, partial industrial realism."]],
  ["mechas/chiting01/cockpit.png", ["CRT-001 Cockpit Interior", "mechas", "CRT-001 cockpit interior, compact industrial pilot chamber, dark red armored shell, black restraint frame, cold blue synchronization interface, damp metal, scratched glass, tactile controls, no holographic clutter, grounded film realism."]],
  ["mechas/chiting01/battle_damage.png", ["CRT-001 Battle Damage", "mechas", "CRT-001 battle damage version, deep crimson armor cracked and salt-burned, black frame exposed, blue reactor still alive, heavy industrial mech after ocean impact, not destroyed, no superhero staging."]],
  ["characters/linzhou/001_portrait.png", ["Lin Zhou Portrait", "characters", "Lin Zhou character portrait, young Chinese pilot, early twenties, tired determined eyes, restrained fear under courage, short practical hair, humid naval base light, natural skin texture, film still realism, not heroic glamour."]],
  ["characters/linzhou/002_fullbody.png", ["Lin Zhou Full Body", "characters", "Lin Zhou full body design, young Chinese pilot, functional dark ocean-defense uniform, slim athletic build, worn boots, damp fabric, no fashion sci-fi, industrial military realism, neutral stance."]],
  ["characters/linzhou/003_pilot_suit.png", ["Lin Zhou Pilot Suit", "characters", "Lin Zhou pilot suit design, pressure-rated mech synchronization suit, dark navy and black material, small blue sync nodes, practical straps and seals, worn by use, anxious readiness, film production asset."]],
  ["characters/linzhou/004_emotion_sheet.png", ["Lin Zhou Emotion Sheet", "characters", "Lin Zhou emotional expression sheet, same young Chinese pilot face, fear, restraint, guilt, resolve, listening to unknown signal, realistic film lighting, no cartoon expression exaggeration."]],
  ["creatures/white_tide/full_body.png", ["White Tide Full Body", "creatures", "White Tide full body creature, ancient deep ocean life, huge yet fragile, white biological armor shell, translucent blue tissue, cracked subtle bioluminescent patterns, pressure-adapted anatomy, not dinosaur, not demon, not boss monster."]],
  ["creatures/white_tide/head_detail.png", ["White Tide Head Detail", "creatures", "White Tide head detail, white shell plates, deep-sea sensory folds, translucent membrane, ancient fragile biology, low saturation ocean blue, no roaring monster mouth, unknown lifeform close study."]],
  ["creatures/white_tide/battle_pose.png", ["White Tide Battle Pose", "creatures", "White Tide defensive battle pose in storm water, huge white armored ocean creature, movement like pressure wave, not aggressive hunting, ancient life trying to survive, scale against ocean mist, grounded film realism."]],
  ["creatures/white_tide/damage_state.png", ["White Tide Damage State", "creatures", "White Tide damaged state, cracked white biological shell, exposed translucent blue tissue, wounded deep-sea life, fragile and enormous, no gore spectacle, sympathetic unknown creature design."]]
]);

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) return walk(full);
    if (!/\.(png|jpg|jpeg)$/i.test(entry)) return [];
    return [full];
  });
}

function versionFromPath(path) {
  const file = path.split("/").pop() ?? "v001.png";
  return file.replace(/\.(png|jpg|jpeg)$/i, "").toUpperCase();
}

const assets = walk(assetRoot).map((file) => {
  const relativePath = relative(assetRoot, file).split(sep).join("/");
  const [name, category, prompt] = promptMap.get(relativePath) ?? [
    relativePath.replace(/\.(png|jpg|jpeg)$/i, ""),
    relativePath.split("/")[0],
    "Local Tide Steel Soul asset imported from disk."
  ];
  const record = {
    id: `${category}:${name}:${relativePath}`,
    name,
    category,
    prompt,
    relativePath,
    version: versionFromPath(relativePath),
    createdAt: new Date(statSync(file).mtimeMs).toISOString(),
    status: "review",
    qualityScore: 0,
    file_size: statSync(file).size
  };
  writeSidecarMetadata(file, record);
  return record;
});

writeFileSync(manifestPath, `${JSON.stringify({ assets }, null, 2)}\n`, "utf8");
console.log(`Imported ${assets.length} real image asset(s) into ${manifestPath}`);

function writeSidecarMetadata(imageFile, record) {
  const jsonPath = join(dirname(imageFile), `${imageFile.split(/[\\/]/).pop().replace(/\.(png|jpg|jpeg)$/i, "")}.json`);
  writeFileSync(jsonPath, `${JSON.stringify({
    asset_name: record.name,
    category: record.category,
    prompt: record.prompt,
    camera: "cinematic production asset reference",
    lighting: "low saturation, cold industrial film light",
    style: "Tide Steel Soul local AI film asset",
    reference: "local manifest and visual bible",
    created_time: record.createdAt,
    episode_use: "EP01"
  }, null, 2)}\n`, "utf8");
}
