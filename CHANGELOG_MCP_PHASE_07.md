# CHANGELOG MCP PHASE 07

## Video Production & Post Pipeline

- Added `src/mcp/videoDirector/` with video direction, camera planning, motion planning, video prompt building, and audio planning.
- Added motion library for camera, character, mecha, and creature movement presets.
- Added `videoState.schema.ts` with guarded video production states.
- Upgraded video adapters for Kling, Veo, and Runway behind a shared `VideoProductionAdapter` interface.
- Added real endpoint/key behavior: missing keys return `needs_key`; missing endpoints return `failed`; no fake completed videos or fake URLs are produced.
- Added `VideoTaskQueue` for persistent in-session video task state.
- Added audio planning, subtitle generation, and episode timeline data structures.
- Upgraded Storyboard with a Video Planning Tab for each shot.
- Added Episode Timeline editor surface with image, video, audio, and subtitle nodes.
- Upgraded Video Center with a real task queue view.
- Upgraded Episode Export package to include video files, audio files, subtitle files, and timeline data under `EP01_FINAL_PACKAGE`.
- Added Command+K commands for video shot generation, retry, episode video creation, and final episode export.

## Gate Rules

- Approved image is required before video production can be meaningful.
- Kling / Veo / Runway adapters never return `completed` unless a real provider response includes a video URL.
- Missing API credentials keep production in `needs_key`.
- Missing live endpoint configuration returns `failed` with explicit reason.
