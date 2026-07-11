# CHANGELOG MCP PHASE 08

## AI Editor Director System

- Added `src/mcp/editorDirector/` with:
  - `EditorAgent.ts`
  - `EditPlanner.ts`
  - `RhythmAnalyzer.ts`
  - `ShotRanking.ts`
  - `EmotionCurve.ts`
  - `TransitionPlanner.ts`
  - `TrailerGenerator.ts`
- Added rhythm analysis for shot duration, camera motion, action intensity, emotion level, and dialogue density.
- Added episode emotion timeline generation.
- Added shot scoring for story importance, visual quality, character continuity, emotion impact, and action clarity.
- Added automatic edit planning with shot order, cut point, transition, BGM start, SFX position, and subtitle timing.
- Added transition planning for cut, fade, cross dissolve, match cut, camera whip, and flash transition.
- Added 30-second trailer planning with Hook, World + Conflict, Peak, and Title Reveal sections.

## UI

- Added `Editor Review` page with emotion curve, shot ranking, timeline preview, music recommendation, and subtitle check.
- Upgraded Episode Timeline with AI Edit Mode:
  - Original Timeline
  - AI Recommended Timeline
  - Final Timeline
- Added Command+K commands:
  - Generate AI Edit
  - Create Trailer
  - Analyze Episode Rhythm
  - Optimize Timeline
  - Export Trailer

## Export

- Upgraded `EP01_FINAL_PACKAGE` with:
  - `EDIT_PLAN.json`
  - `EMOTION_CURVE.json`
  - `TRAILER_PLAN.json`
  - `SUBTITLE.srt`
  - `TIMELINE.json`

## Guardrails

- AI Edit does not delete source assets.
- AI Edit does not overwrite the original timeline.
- All edit decisions remain in review until manually approved.
- Story Bible and Episode Bible were not modified.
