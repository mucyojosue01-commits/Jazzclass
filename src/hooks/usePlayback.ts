import { useCallback, useEffect, useRef, useState } from 'react';
import { playNote, suspendAudio, resumeAudio } from '../lib/pianoAudio';

type Step = { notes: number[]; lh?: number[]; rh?: number[]; beats: number; label?: string };
type Item = { id: string; title: string; sub?: string; bpm: number; loop: boolean; steps: Step[] };
export default function usePlayback() {
  const [playing,setPlaying]=useState(false);
  const [paused,setPaused]=useState(false);
  const [hasSequence,setHasSequence]=useState(false);
  const [stepIndex,setStepIndex]=useState(-1);
  const [stepNotes,setStepNotes]=useState<number[]>([]);
  const [stepLabel,setStepLabel]=useState('');
  const timer=useRef<number|null>(null);
  const deadline=useRef(0);
  const remaining=useRef(0);
  const generation=useRef(0);
  const noteHandles=useRef<{stop:()=>void}[]>([]);
  const itemRef=useRef<Item|null>(null);
  const callbacks=useRef<{onStep:(notes:number[],lh:number[],rh:number[])=>void;onFinish:()=>void;velocity:number}>({onStep:()=>{},onFinish:()=>{},velocity:.5});
  const indexRef=useRef(0);

  const clearTimer=()=>{if(timer.current!==null){window.clearTimeout(timer.current);timer.current=null;}};
  const stop=useCallback(()=>{
    generation.current++;clearTimer();noteHandles.current.forEach(h=>{try{h.stop()}catch{}});noteHandles.current=[];itemRef.current=null;remaining.current=0;
    setPlaying(false);setPaused(false);setHasSequence(false);setStepIndex(-1);setStepNotes([]);setStepLabel('');
    void resumeAudio();
  },[]);

  const scheduleNext=useCallback((token:number,delay:number)=>{
    clearTimer();remaining.current=delay;deadline.current=performance.now()+delay;
    timer.current=window.setTimeout(()=>{
      timer.current=null;
      if(token!==generation.current||!itemRef.current)return;
      const item=itemRef.current;const next=indexRef.current+1;
      if(next>=item.steps.length){
        if(item.loop){noteHandles.current=[];indexRef.current=0;runStep(token,0);}
        else{noteHandles.current=[];itemRef.current=null;setPlaying(false);setPaused(false);setHasSequence(false);setStepIndex(-1);setStepNotes([]);setStepLabel('');callbacks.current.onFinish();}
        return;
      }
      indexRef.current=next;runStep(token,next);
    },Math.max(0,delay));
  },[]);

  const runStep=(token:number,index:number)=>{
    const item=itemRef.current;if(!item||token!==generation.current)return;
    const step=item.steps[index];const beat=60000/(item.bpm||90);const duration=Math.max(.28,step.beats*beat/1000*.88);
    step.notes.forEach(n=>noteHandles.current.push(playNote(n,{duration,velocity:callbacks.current.velocity})));
    setStepIndex(index);setStepNotes(step.notes);setStepLabel(step.label||'');
    callbacks.current.onStep(step.notes,step.lh??[],step.rh??step.notes);
    scheduleNext(token,step.beats*beat);
  };

  const play=useCallback((item:Item,onStep:(notes:number[],lh:number[],rh:number[])=>void,onFinish:()=>void,velocity=.5)=>{
    stop();const token=generation.current;itemRef.current=item;callbacks.current={onStep,onFinish,velocity};indexRef.current=0;
    setHasSequence(true);setPlaying(true);setPaused(false);runStep(token,0);
  },[stop]);

  const pause=useCallback(async()=>{
    if(!itemRef.current||!playing)return;
    remaining.current=Math.max(0,deadline.current-performance.now());clearTimer();
    await suspendAudio();setPlaying(false);setPaused(true);
  },[playing]);
  const resume=useCallback(async()=>{
    if(!itemRef.current||!paused)return;
    await resumeAudio();setPaused(false);setPlaying(true);
    scheduleNext(generation.current,remaining.current);
  },[paused,scheduleNext]);

  useEffect(()=>()=>{generation.current++;clearTimer();void resumeAudio();},[]);
  return {playing,paused,hasSequence,stepIndex,stepNotes,stepLabel,play,stop,pause,resume};
}