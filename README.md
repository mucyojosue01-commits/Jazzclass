# JazzClass — Piano Learning Studio

JazzClass is a practical piano-learning studio focused on jazz, gospel, praise, worship and pop. It combines a structured music-theory catalogue with a live practice keyboard and an expanding MIDI desktop workflow.

## Learning workspace
- React + TypeScript + Vite application.
- F♯-centred learning catalogue with theory tools for all 12 keys.
- Scales, modes, chord qualities, chord-scale families, two-hand voicings, inversions, slash chords and progressions.
- 60 passing-chord pathways and 100 short runs/licks.
- Tempo, touch/velocity, output level, loop and metronome controls.
- Ear-training workspace for interval and chord-quality recognition.
- Live on-screen piano and hand-separated note feedback.
- Personal folders, favourites and saved practice progress.

## MIDI Studio
- Discover USB and Bluetooth MIDI devices supported by Windows.
- Select independent MIDI input and output ports.
- Live note detection, chord recognition, velocity and sustain-pedal monitoring.
- Guided scale/chord exercises with note-match feedback.
- MIDI recording and Standard MIDI File export.
- Independent PC audio-output selection where supported by the audio driver/browser.
- Selectable synthesized piano, electric-piano and organ practice voices.
- Import and play Standard MIDI files.
- Live note lane, staff-position preview, finger-number suggestions and a ii–V–I backing progression.

## Windows desktop application
The repository includes an Electron desktop wrapper and a Windows x64 NSIS installer workflow.

### Build locally
```bash
npm install
npm run desktop:dev
```

### Build the installer
On Windows:
```bash
npm run desktop:dist
```

GitHub Actions also builds the Windows installer and uploads a `JazzClass-Windows-x64` artifact. Open the repository's Actions tab, choose the latest successful **Build JazzClass for Windows** run, then download its artifact.

## MIDI setup
1. Connect the keyboard directly to the PC with a USB MIDI cable, or pair a supported Bluetooth MIDI device.
2. Open JazzClass Desktop and select the keyboard under **MIDI Studio → Input Device**.
3. Select an output device only if you want JazzClass to send MIDI back to external hardware.
4. Choose an instrument voice and PC audio output if desired.
5. Play a key; the live note display, chord detector and exercise feedback should respond.

MIDI availability depends on the keyboard's Windows driver and device support. For best latency, use a direct USB connection and a low-latency audio driver where available.

## Audio
JazzClass currently uses its local Web Audio synthesis engine for immediate practice tones. A bundled sampled grand-piano library and dedicated ASIO/native audio engine are later upgrades; this build does not install audio drivers or claim DAW-grade piano sampling.

## Development commands
```bash
npm run dev
npm run test
npm run build
```

## Current scope notes
The first desktop MIDI increment covers single-track Standard MIDI import/playback and recording/export. Full engraved sheet music, multi-track editing and isolated left/right-hand track workflows are follow-on improvements.


## Key-first harmony learning
JazzClass teaches practical keyboard harmony through visible piano keys, chord names, hand shapes and musical movement. The Harmony Workshop includes transposable jazz, gospel, worship, blues and minor-key progressions, plus secondary dominants, tritone substitutions, diminished passing chords and chromatic approaches. Every exercise is selectable in all 12 keys and displays separate left-hand bass shapes and right-hand chord voicings.

**Notation scope:** JazzClass is intentionally key-and-chord focused. It does not teach through staff bars, semibreves, breves or other note-duration symbols. The learning surface prioritizes keyboard keys, chord tones, voicings, progressions and passing-chord resolution. MIDI song playback still preserves the timing contained in imported MIDI files without presenting traditional rhythmic notation.
