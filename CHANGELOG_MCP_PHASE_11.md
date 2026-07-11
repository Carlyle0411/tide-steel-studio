# CHANGELOG MCP PHASE 11

## EP01 Visual Production Mode

- Added EP01 visual production pipeline:
  - `src/mcp/ep01Production/visualProduction/AssetGenerator.ts`
  - `KeyframeGenerator.ts`
  - `ReferenceBinder.ts`
  - `VisualReview.ts`
  - `AssetVersionManager.ts`
  - `VisualProductionStats.ts`

## Asset Locks

- Added `projects/tide-steel-soul/episodes/EP01/EP01_CHARACTER_LOCK.json`
- Added `MECHA_LOCK.json`
- Added `CREATURE_LOCK.json`
- Added `ENVIRONMENT_LIBRARY.json`

## Keyframe Generation

- `Generate Keyframe` now creates and runs a real GPT Image2 production task for EP01 KF01.
- Added `Generate EP01 Visual Batch 01` command for:
  - KF01: 2042 Hangzhou Bay coastline defense line
  - KF02: White Tide first appearance
  - KF03: Deep Blue Base interior
  - KF04: CRT001 first appearance
- Missing OpenAI API key returns `needs_key`.
- No fake image and no fake `completed` status are created.

## Review

- Added Visual Review Center.
- Added VisualQualityScore:
  - Composition
  - Lighting
  - Character Similarity
  - World Consistency
  - Cinematic Level
- Assets scoring below 85 cannot be approved into video readiness.

## Dashboard

- Added EP01 Visual Production status:
  - Characters
  - Mechas
  - Creatures
  - Environment
  - Keyframes

## Guardrails

- Story Bible was not modified.
- Episode Bible was not modified.
- Approved Assets were not modified.
- Review remains mandatory before video production.
