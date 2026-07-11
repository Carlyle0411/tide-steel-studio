# CHANGELOG MCP PHASE 12

## AI Asset Factory Mode

- Added `src/mcp/assetFactory/`:
  - `AssetFactory.ts`
  - `AssetGenerationQueue.ts`
  - `AssetPromptEngine.ts`
  - `AssetQualityChecker.ts`
  - `AssetLibraryManager.ts`
  - `AssetVersionController.ts`
  - `KlingVideoPromptGenerator.ts`
  - `VideoTemplateLibrary.ts`

## Asset Generation Queue

- Added task types:
  - `CHARACTER`
  - `MECHA`
  - `CREATURE`
  - `ENVIRONMENT`
  - `PROP`
  - `KEYFRAME`
- Added task states:
  - `draft`
  - `generating`
  - `generated`
  - `review`
  - `approved`
  - `rejected`
  - `needs_key`
  - `failed`

## GPT Image2 Flow

- `Generate Character Assets`, `Generate Mecha Assets`, `Generate Creature Assets`, and `Generate Environment Assets` now route through the existing GPT Image2 adapter.
- Missing API key returns `needs_key`.
- No fake images are created.
- No fake `completed` status is created.
- Assets only enter Review Queue after the GPT Image2 adapter returns a real image.

## Production Plan

- Added automatic first-batch planning for:
  - Lin Zhou, Xu Ran, Chen Mu, Tang Xiaoman
  - CRT-001 Red Thunder, Xuanjing-03, Baiyuan-07
  - White Tide, Sting Tide, Black Tide Mother
  - 2042 Hangzhou Bay, Deep Blue Base, Ocean Rift Gate, Underwater Ruins, Cockpit

## AI Asset Library

- Added AI Asset Library page.
- Displays:
  - Preview Image
  - Name
  - Version
  - Prompt
  - Generation Date
  - Quality Score
  - Used Count

## Review And Consistency

- Added asset consistency scoring:
  - Character Face
  - Hair
  - Clothing
  - Color
  - Material
  - Mecha Design
  - Creature Structure
- Visual Review Center now supports:
  - Generate Again
  - Approve
  - Reject
  - Compare Version placeholder
- Assets below 85 remain blocked from approved/video readiness.

## Kling Prompt Generation

- Added Kling Video Prompt Generator.
- It does not call Kling API.
- It outputs:
  - Scene
  - Subject
  - Action
  - Camera Movement
  - Lens
  - Lighting
  - Atmosphere
  - Duration
  - Motion Physics
  - Negative Prompt

## Dashboard

- Added AI Asset Factory stats:
  - Generated Assets
  - Approved Assets
  - Pending Review
  - Failed Generation
  - Characters
  - Mechas
  - Creatures
  - Environment

## Command+K

- Added:
  - Generate Character Assets
  - Generate Mecha Assets
  - Generate Creature Assets
  - Generate Environment Assets
  - Generate EP01 Keyframes
  - Generate Kling Prompts

## Guardrails

- GPT Image2 real-call capability is preserved.
- Video stage does not call external APIs in this phase.
- No Story Bible changes.
- No Episode Bible changes.
- No Approved Asset mutation.
