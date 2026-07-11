# MCP Phase 13 - Local Asset Generation Workflow

## Positioning Change

The Movie Control Center is now treated as a personal Tide Steel Soul AI film workbench, not a commercial SaaS or external API platform.

## Added

- Added `src/mcp/localAssetGenerator/`.
- Added local asset input and manifest types.
- Added a 13-item Tide Steel Soul local asset plan:
  - CRT-001 Chiting-01: front, side, back, cockpit, battle damage.
  - Lin Zhou: portrait, full body, pilot suit, emotion sheet.
  - White Tide: full body, head detail, battle pose, damage state.
- Added `Generate Tide Steel Assets` to Command+K.
- Added local generation task registration using `local_codex_imagegen`.

## Changed

- Asset Library now scans `projects/tide-steel-soul/assets/asset-library.json`.
- Asset cards only render when a real local image path exists.
- Empty asset states no longer mention API keys or `needs_key`.
- Command+K character, mecha, creature, environment, and EP01 visual generation commands now create local Codex image generation tasks instead of calling external image APIs.
- Video generation commands are paused for this phase and no longer call external Kling/Veo adapters.

## Asset Root

`projects/tide-steel-soul/assets/`

## Rule

No placeholder image, fake preview, fake URL, fake completion state, or external API success is accepted in this workflow. A generated asset enters the library only after a real PNG/JPG exists on disk and is recorded in the local manifest.
