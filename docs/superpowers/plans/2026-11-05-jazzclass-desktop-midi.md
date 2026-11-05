# JazzClass Desktop MIDI Studio — Implementation Plan

## Task 1 — MIDI engine and file format
- Add note/chord helpers, SMF writer and PPQ SMF reader.
- Verify type safety and parser edge cases through the project build.

## Task 2 — MIDI Studio UI
- Add MIDI access/device selection and hot-plug refresh.
- Implement note-on/off, velocity, live held notes, chord label, guided challenges, metronome, recording, MIDI export/import/playback.
- Verify keyboard events cleanly release audio voices and output forwarding.

## Task 3 — App navigation and visual integration
- Add MIDI Studio tab to existing React application.
- Add responsive premium dark styling without changing existing learning pages.
- Verify TypeScript and Vite production build.

## Task 4 — Windows desktop packaging
- Add Electron main/preload with secure BrowserWindow settings.
- Add Windows x64 NSIS package scripts and CI artifact workflow.
- Verify npm build locally where possible and use Windows CI as the authoritative installer build.

## Review focus
- MIDI note-off and held-note correctness; no stuck notes on device change/unmount.
- MIDI event timing and variable-length quantities.
- Electron renderer security and installer reproducibility.
- Preserve existing app routes, catalogue and audio behavior.
