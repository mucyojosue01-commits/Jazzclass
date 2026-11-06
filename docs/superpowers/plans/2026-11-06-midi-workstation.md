# MIDI Workstation Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a full-width MIDI workstation with synchronized physical keyboard display, robust performance assessment, structured lessons and durable local progress.

**Architecture:** Keep MIDI device ownership in MidiStudio; publish live note/hand/chord state to App through a typed CustomEvent so the existing fixed PianoDock can render on the MIDI tab. Put scoring and progress normalization in pure TypeScript modules with Vitest coverage.

**Tech Stack:** React 18, TypeScript, Vite, Web MIDI, Web Audio, localStorage, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-06-midi-workstation-design.md`

## Global Constraints
- Preserve existing learning tabs, MIDI recording/import/export and Harmony Workshop.
- Support all 12 keys; do not introduce a paid backend requirement.
- MIDI assessment is based on MIDI events, not microphone/acoustic recognition.
- Left hand is green; right hand is gold.
- Never show fabricated performance statistics.

## Review Focus
- Empty note attempts must not produce NaN or a fake score.
- Repeated notes and octave doublings must not inflate pitch-class matching.
- MIDI note-off, sustain release and device disconnect must clear dock highlights.
- A missing Web MIDI API must leave the rest of the studio usable.
- Local storage corruption or old versions must not prevent the workstation from opening.

---

### Task 1: Pure performance assessment

**Files:**
- Create: `src/lib/performanceAnalysis.ts`
- Create: `src/lib/performanceAnalysis.test.ts`

**Interfaces:**
- `assessPitchSet(target: number[], played: number[]): PitchAssessment`
- Return `score, precision, recall, f1, matched, missing, extra`; score values are percentages 0–100, and empty played sets return score 0.
- Compare unique MIDI pitches and also expose unique pitch classes for diagnostic display.

- [ ] Write tests for exact match, partial match, missing notes, extra notes, octave doubling and empty attempt.
- [ ] Run the targeted test and confirm expected failures.
- [ ] Implement the pure scoring function.
- [ ] Run targeted and full test suite.

### Task 2: Local MIDI lesson curriculum and progress

**Files:**
- Create: `src/lib/midiCurriculum.ts`
- Create: `src/lib/midiProgress.ts`
- Create: `src/lib/midiProgress.test.ts`

**Interfaces:**
- Curriculum records have stable id, level, category, title, description, target MIDI notes, hand assignment, key, BPM, and coaching tip.
- `loadMidiProgress()`, `saveMidiProgress()`, `recordMidiAttempt()`, `getMidiProgressSummary()`.
- Store attempts, best score, session count, total practice seconds, last practiced, and weak pitch classes in versioned localStorage.

- [ ] Test normalization, corrupted storage fallback, best-score preservation and summary calculations.
- [ ] Verify RED, implement, verify GREEN.

### Task 3: Full-screen MIDI workstation UI

**Files:**
- Modify: `src/components/MidiStudio.tsx`
- Modify: `src/style.css`
- Create: `src/components/MidiLessonPanel.tsx` only if separation improves maintainability.

- [ ] Replace fixed five-exercise counter with searchable level/category curriculum and next/retry controls.
- [ ] Add score breakdown, missing/extra-note diagnostics, lesson guidance and genuine progress summary.
- [ ] Organize device, live performance, lesson, recorder, song import, tempo and Harmony Workshop into a responsive workstation layout.
- [ ] Keep all existing MIDI tools reachable and accessible at tablet/mobile widths.

### Task 4: Shared live keyboard synchronization

**Files:**
- Modify: `src/components/MidiStudio.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/PianoDock.tsx` only if needed.

- [ ] Publish live note, left/right hand and chord state from MidiStudio.
- [ ] Subscribe in App and render the fixed bottom piano while MIDI Studio is active.
- [ ] Clear live dock state on note-off, sustain release, disconnect and tab exit.
- [ ] Verify the dock reflects the connected physical keys and hand colours.

### Task 5: Responsive visual polish and verification

**Files:**
- Modify: `src/style.css`
- Modify: `README.md`

- [ ] Use full available viewport width on MIDI Studio, with a compact top header and scrollable content region.
- [ ] Add responsive breakpoints and keyboard dock sizing so the dock does not cover lesson controls.
- [ ] Run `npm run test` and `npm run build` through CI; inspect failures and fix before merge.
- [ ] Review the final diff and verify the production deployment after merge.
