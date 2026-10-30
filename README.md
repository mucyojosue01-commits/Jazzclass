# JazzClass — F♯ Piano Lab

JazzClass is a responsive piano-learning application focused on F♯ harmony, practical two-hand piano playing, jazz, gospel, praise, worship and pop.

## Current application
- React + TypeScript + Vite frontend (not a single HTML-only prototype).
- Dark, black-and-white interface with warm gold left-hand markers and chocolate right-hand markers.
- Patrick Hand typeface, selected to match the handwritten font in the supplied reference.
- Sampled acoustic grand-piano audio using Soundfont Player and the FluidR3_GM soundfont.
- On-screen note readout showing left-hand and right-hand notes as they sound.
- Adjustable tempo (default 72 BPM), touch/velocity, output level, loop and metronome controls.
- F♯ major, natural minor, harmonic minor, melodic minor, modes, pentatonic and blues scales.
- Harmonised major and minor chord-scale families, displayed as complete two-hand chords.
- Jazz, worship, praise, pop and gospel progressions.
- 50 passing-chord voicings with separate LH and RH combinations.
- 100 short runs and licks, with musical tips and target-chord suggestions.
- Responsive keyboard and lesson panels for phone and desktop.

## Run locally
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

## Audio
The app loads sampled acoustic grand-piano notes on demand. The first load requires an internet connection. Press “Load real piano sound” or play a lesson after opening the app. Tempo defaults to 72 BPM to keep examples relaxed; use the tempo control to adjust it.

## Music notation
- LH = left hand (bass and support).
- RH = right hand (chords, voicings and melody).
- The keyboard and live note display distinguish LH in warm gold and RH in chocolate.
- Enharmonic notes such as E♯ sound at the same pitch as F, while the lesson spelling preserves the harmonic function.

## Next development areas
A dedicated backend with accounts, saved practice sessions, learning history, custom progressions, and cross-device sync can be added as a separate Supabase layer.
