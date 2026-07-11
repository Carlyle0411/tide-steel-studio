# CHANGELOG MCP PHASE 13

## Real Asset Generation Execution

- Upgraded GPT Image2 adapter output to include:
  - `imageUrl`
  - `localPath`
  - `assetPath`
  - `metadata`
- Added asset metadata fields:
  - `assetType`
  - `assetName`
  - logical local asset path
- Added URL-to-dataURL fallback so returned OpenAI image URLs can be stored and previewed in the browser asset database.

## Local Asset Storage

- Added `src/storage/assets/` structure for future materialized image files:
  - `characters/`
  - `mechas/`
  - `creatures/`
  - `environment/`
  - `props/`
- Added `src/storage/assets/README.md`.
- No fake PNG files are created.

## Asset Import Pipeline

- Added `src/mcp/assetFactory/AssetImportPipeline.ts`.
- Import flow now handles:
  - GPT Image2 output
  - local path registration
  - metadata
  - quality score
  - Review Queue entry

## Real Generation Commands

- `Generate Mecha Assets` now attempts five real GPT Image2 generations for CRT-001:
  - Front View
  - Side View
  - Back View
  - Cockpit
  - Battle Damage
- `Generate Character Assets` now attempts eight real GPT Image2 generations:
  - Lin Zhou: Character Portrait, Full Body, Pilot Suit, Emotion Sheet
  - Xu Ran: Character Portrait, Full Body, Pilot Suit, Emotion Sheet

## Asset Library

- Asset Library displays real stored asset records from the asset database.
- Cards show:
  - Preview image
  - Asset name
  - Category
  - Version
  - Prompt
  - Created time
  - Quality score

## Execution Test

- Ran `Generate Mecha Assets` preflight in the current environment.
- Result: `needs_key`.
- Reason: `OPENAI_API_KEY` / `VITE_OPENAI_API_KEY` is not present in the shell environment.
- No fake image was created.
- No fake completed status was created.

## Guardrails

- GPT Image2 remains the only image-generation execution path.
- Missing key returns `needs_key`.
- Video API is not called in this phase.
- Kling prompt generation remains text-only.
