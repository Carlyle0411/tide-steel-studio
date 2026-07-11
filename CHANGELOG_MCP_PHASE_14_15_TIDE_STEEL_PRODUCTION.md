# MCP Phase 14 + 15 - Tide Steel Production Pipeline

## Positioning

The project remains a personal AI film production workbench for Tide Steel Soul.

No SaaS account system, payment system, external API service, OpenAI API key manager, Kling API, or Veo API was added.

## Added

- Added `Tide Steel Studio` page to the Movie Control Center.
- Added EP01 production dashboard cards:
  - Asset Progress
  - Character Progress
  - Mecha Progress
  - Creature Progress
  - Environment Progress
  - Keyframe Progress
  - Kling Prompt Progress
- Added `projects/tide-steel-soul/EP01/EP01_ASSET_MANIFEST.json`.
- Added `projects/tide-steel-soul/EP01/EP01_KEYFRAME_MANIFEST.json`.
- Added `projects/tide-steel-soul/EP01/EP01_KEYFRAME_TASKS.json`.
- Added `projects/tide-steel-soul/EP01/EP01_KLING_PROMPTS.json`.
- Added sidecar metadata JSON generation for every real local PNG asset.
- Added local EP01 Studio data reader:
  - `src/mcp/tideSteelStudio/EP01StudioData.ts`
- Added Command+K entries:
  - Generate EP01 Asset Pack
  - Generate EP01 Keyframes
  - Generate Chiting01 Assets
  - Generate Character Assets
  - Generate Creature Assets
  - Generate Kling Prompts

## Changed

- AI Asset Library remains local-file only.
- Kling prompt generation produces text only.
- Keyframe production now creates traceable local task records and does not create fake images.
- Video production remains manual. No video API is called.

## Verification

- `npm run import:assets` imported 13 real PNG assets.
- `npm run export:kling-prompts` exported 18 Kling prompts.
- `npm run export:keyframe-tasks` exported 18 keyframe tasks.
- `npm run build` passed.

## Hard Rule

No fake image, placeholder preview, fake URL, or fake completed state is allowed. A visual asset exists only when a real PNG/JPG file exists on disk and is registered in the local asset manifest.
