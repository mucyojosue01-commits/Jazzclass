# JazzClass Desktop

Windows desktop wrapper for the JazzClass piano learning studio. The renderer stays in React/TypeScript; Electron provides a native Windows window and the Chromium Web MIDI surface.

## Development
`npm install`, then `npm run desktop:dev`.

## Windows installer
Run `npm run desktop:dist` on Windows or use the GitHub Actions workflow at `.github/workflows/windows-desktop.yml`. The workflow produces a Windows x64 NSIS installer as a downloadable workflow artifact.

## MIDI requirements
Use a USB MIDI cable or a Bluetooth MIDI adapter/device supported by Windows. Grant MIDI access when prompted, then select the keyboard in MIDI Studio. Some keyboards expose separate input and output ports; choose each independently. Audio output uses the PC's selected Windows playback device.

The desktop wrapper does not install a virtual piano driver or alter the keyboard's firmware. MIDI device access is provided by Chromium's Web MIDI API. For best latency, connect the keyboard directly by USB and use a low-latency Windows audio driver where available.
