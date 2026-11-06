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

## MIDI Studio — Performance Workstation
The browser MIDI Studio is the primary full-width performance workspace. It includes:
- Full-width responsive workstation layout with a fixed live piano dock.
- USB/Bluetooth MIDI input discovery, independent MIDI output selection, and selectable browser audio output.
- Live note names, chord recognition, velocity readout, sustain-pedal state, and separate left/right hand displays.
- Automatic bottom-piano synchronization from physical MIDI note-on/note-off events; the visible keyboard expands to include notes outside its default range.
- A 20-lesson, all-12-key curriculum across Foundation, Developing, Advanced and Professional levels: scales, triads/sevenths, jazz voicings, gospel/worship, progressions and technique.
- Chord-by-chord practice for jazz turnarounds, minor iiø–V–i and blues pathways.
- Hybrid pitch matching: precision, recall, F1-style score, pitch-class fit, matched notes, missing notes and extra notes.
- Local-first lesson records: attempts, personal best, mastery threshold, practice time and recurring weak pitch classes. No Supabase project is required for MIDI progress.
- MIDI recording, Standard MIDI File export, MIDI import/playback, metronome, tempo control, instrument selection and Harmony Workshop.

**Assessment note:** scoring evaluates the MIDI pitches actually received from the keyboard. Pitch-class fit helps identify the right harmony when octave placement differs; exact-pitch F1 still penalizes octave errors and extra notes. The app does not claim to assess acoustic piano sound through the microphone.

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
The first desktop MIDI increment covers single-track Standard MIDI import/playback and recording/export. Traditional staff bars and note-duration notation are intentionally out of scope; the learning interface focuses on keyboard keys, chord names, voicings, progressions and passing chords. Advanced multi-track MIDI editing and isolated left/right-hand MIDI tracks remain future upgrades.


## Key-first harmony learning
JazzClass teaches practical keyboard harmony through visible piano keys, chord names, hand shapes and musical movement. The Harmony Workshop includes transposable jazz, gospel, worship, blues and minor-key progressions, plus secondary dominants, tritone substitutions, diminished passing chords and chromatic approaches. Every exercise is selectable in all 12 keys and displays separate left-hand bass shapes and right-hand chord voicings.

**Notation scope:** JazzClass is intentionally key-and-chord focused. It does not teach through staff bars, semibreves, breves or other note-duration symbols. The learning surface prioritizes keyboard keys, chord tones, voicings, progressions and passing-chord resolution. MIDI song playback still preserves the timing contained in imported MIDI files without presenting traditional rhythmic notation.


## Web app and installable PWA
JazzClass is available as a responsive browser application as well as a Windows desktop build. The web app can be installed from supported browsers (Chrome/Edge) and includes an app manifest, branded icon, and a service worker that caches the application shell and previously loaded same-origin assets for repeat/offline launches. Personal practice data remains available in local storage; signed-in cloud workspace sync and the online progression catalogue require an internet connection.

### Browser MIDI support
For live external keyboard input in the web app, use a current desktop Chrome or Edge browser over HTTPS and grant MIDI permission when prompted. Browser MIDI availability varies by browser and operating system; the Windows desktop application remains the fallback where Web MIDI is unavailable. Mobile browsers generally do not expose the same USB/Bluetooth MIDI access as desktop browsers.
