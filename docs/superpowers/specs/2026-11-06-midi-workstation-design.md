# JazzClass MIDI Workstation — Design

## Intent
Turn the MIDI Studio into the primary, full-screen browser piano workstation. The connected instrument must drive one coherent live state: input status, note/chord analysis, assessment, hand split, and the fixed bottom piano. The web app is the reference implementation; desktop will inherit it later.

## Goals
- Use the viewport efficiently with a dedicated workstation layout, not the current narrow catalogue/sidebar shell.
- Synchronize physical MIDI note-on/note-off and sustain state with the shared bottom piano.
- Provide reliable chord and note-set assessment with precision, recall, F1-style score, missing/extra notes, hand separation, and order-aware sequence scoring for scale lessons; show live velocity as a separate signal.
- Provide a structured, transposable lesson path with levels, technique groups, clear targets and repeatable practice.
- Persist local lesson progress, attempt count, best score, practice time and weak pitch classes without requiring Supabase.
- Retain device selection, audio instrument, recording/export, MIDI import/playback, metronome and Harmony Workshop while making the controls coherent.

## Non-goals
- No new paid backend or database requirement.
- No claim that a browser can read acoustic sound from a piano; assessment uses MIDI events.
- No score/notation engraving or DAW-grade multitrack editor in this increment.
- No change to the existing desktop packaging architecture.

## Approaches
1. Replace the whole application shell: rejected because it risks existing learning tabs and shared playback.
2. Build an isolated MIDI workstation inside the existing app and bridge live MIDI state to the shared piano dock: selected because it keeps the proven music engine and gives MIDI a dedicated, full-width workspace.
3. Add a separate MIDI application: rejected because it duplicates MIDI/audio state and fragments the product.

## Architecture
Keep React, TypeScript, Vite, Web MIDI and the current Web Audio engine. Add a pure performance-assessment module with deterministic tests. Keep device ownership inside MidiStudio, publish typed live-key state through a window CustomEvent, and let App render the bottom PianoDock on the MIDI tab and consume that event. Persist MIDI lesson records in a versioned localStorage key with defensive migration/normalization. Use CSS scoped to the MIDI workstation and responsive viewport breakpoints.

## Assessment model
For a target pitch set and a captured attempt, calculate precision, recall and F1-style pitch match; report missing and extra pitch classes/notes separately. For ordered scale lessons, combine pitch-set F1 (70%) with sequence-order score (30%); chord/voicing lessons use pitch-set F1. Keep pitch-class fit as a separate diagnostic and velocity as a live readout rather than implying unimplemented timing or dynamics grading. Avoid presenting a misleading single percentage when the attempt has no notes or when timing data is unavailable.

## Constraints and calls
- All 12 keys; preserve keyboard range and existing sound engine.
- MIDI input note-on/off and sustain must update in real time.
- Green indicates left hand, gold indicates right hand.
- Local-first progress must work without Supabase.
- Use no fake analytics; show empty states until actual practice data exists.
