import { useCallback, useEffect, useRef, useState } from 'react';
import { playNote } from '../lib/pianoAudio';

type Step = { notes: number[]; beats: number; label?: string };
type Item = { id: string; title: string; sub?: string; bpm: number; loop: boolean; steps: Step[] };
export default function usePlayback() {
  const [playing, setPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [stepNotes, setStepNotes] = useState<number[]>([]);
  const [stepLabel, setStepLabel] = useState('');
  const timers = useRef<number[]>([]);
  const handles = useRef<{ stop: () => void }[]>([]);
  const generation = useRef(0);

  const clear = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  const stop = useCallback(() => {
    generation.current += 1;
    clear();
    handles.current.forEach(h => { try { h.stop(); } catch {} });
    handles.current = [];
    setPlaying(false); setStepIndex(-1); setStepNotes([]); setStepLabel('');
  }, []);

  const play = useCallback((item: Item, onStep: (notes: number[]) => void, onFinish: () => void, velocity = .5) => {
    stop();
    setPlaying(true);
    const run = () => {
      const token = generation.current;
      const beat = 60 / (item.bpm || 90);
      let offset = 0;
      const scheduled: {at:number; step:Step; index:number}[] = [];
      item.steps.forEach((step, index) => {
        const at = offset;
        const duration = Math.max(.28, step.beats * beat * .88);
        step.notes.forEach(n => handles.current.push(playNote(n, { when: at, duration, velocity })));
        scheduled.push({ at, step, index });
        timers.current.push(window.setTimeout(() => {
          if (token !== generation.current) return;
          setStepIndex(index); setStepNotes(step.notes); setStepLabel(step.label || '');
          onStep(step.notes);
        }, at * 1000));
        offset += step.beats * beat;
      });
      timers.current.push(window.setTimeout(() => {
        if (token !== generation.current) return;
        if (item.loop) { handles.current = []; clear(); run(); }
        else { setPlaying(false); setStepIndex(-1); setStepNotes([]); setStepLabel(''); onFinish(); handles.current = []; }
      }, offset * 1000 + 100));
    };
    run();
  }, [stop]);

  useEffect(() => () => {
    generation.current += 1; clear();
    handles.current.forEach(h => { try { h.stop(); } catch {} });
  }, []);
  return { playing, stepIndex, stepNotes, stepLabel, play, stop };
}
