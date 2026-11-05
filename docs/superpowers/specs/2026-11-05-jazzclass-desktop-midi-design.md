# JazzClass Desktop MIDI Studio — Design

## Intent
Extend the existing JazzClass React + TypeScript + Vite piano learning product into a Windows desktop piano-learning studio. A player connects a physical MIDI keyboard, sees live notes and chord recognition, practices guided exercises, records performances, imports and exports Standard MIDI Files, and uses the existing jazz theory catalogue and piano engine.

## Goals
- Preserve the current JazzClass catalogue, F♯-centred lessons, chord voicings, passing chords, runs and existing browser audio.
- Add a Windows desktop application with a native window and Windows installer.
- Add MIDI input/output device discovery, hot-plug refresh, note-on/note-off, velocity, held-note state and chord recognition.
- Add guided note/chord exercises, accuracy feedback, tempo/metronome, recording and Standard MIDI import/export.
- Provide a repeatable Windows CI build artifact.

## Non-goals for this first desktop increment
- No proprietary sampled soundfont bundled in the installer.
- No ASIO driver installation or modification of Windows audio devices.
- No cloud account requirement for MIDI device access or practice.
- No claim of full DAW-grade notation engraving or multi-track MIDI editing in this increment.

## Approaches
1. Keep browser-only Web MIDI: lowest packaging cost, but device support and install experience vary by browser.
2. Electron desktop wrapper around the existing React application with Chromium Web MIDI: reuses the working product and provides Windows installer/CI. Chosen for the first desktop release.
3. Fully native C++/JUCE engine: best long-term audio/MIDI latency and deeper hardware access, but would replace the current frontend/audio architecture and substantially delay delivery.

## Decision
Use Electron + Vite + React/TypeScript. Keep renderer isolated (contextIsolation, nodeIntegration disabled, sandbox enabled); expose only harmless desktop metadata. Use the Web MIDI API for MIDI input/output and Web Audio for the current synthesized piano sound. Produce Windows x64 NSIS installer via GitHub Actions.

## User experience
A new MIDI Studio tab provides device selection, live note/chord display, a small keyboard visualizer, scale/chord challenges with score feedback, metronome/tempo, MIDI recording/export, and MIDI file import/playback. Existing Learn, Theory Lab, Progressions, Passing Chords, Runs, and My Stuff remain intact.

## Constraints and risks
- Web MIDI requires a secure context and user permission; device access depends on OS drivers and browser/Electron support.
- The Electron installer must be built on Windows CI. A source commit is not a tested installer.
- Standard MIDI import supports PPQ timing; SMPTE time division is explicitly rejected. Tempo-map fidelity and advanced track isolation are future work.
- The existing Web Audio synthesizer is a practice tone engine, not a sampled concert grand or DAW-grade sound module.
