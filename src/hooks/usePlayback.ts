import { useCallback, useEffect, useRef, useState } from 'react';
import { playNote, suspendAudio, resumeAudio } from '../lib/pianoAudio';
type Step = { notes:number[]; lh?:number[]; rh?:number[]; beats:number; label?:string };
type Item = { id:string; title:string; sub?:string; bpm:number; loop:boolean; steps:Step[] };
export default function usePlayback(){
 const [playing,setPlaying]=useState(false),[paused,setPaused]=useState(false),[stepIndex,setStepIndex]=useState(-1),[stepNotes,setStepNotes]=useState<number[]>([]),[stepLabel,setStepLabel]=useState('');
 const timers=useRef<number[]>([]),handles=useRef<{stop:()=>void}[]>([]),generation=useRef(0),itemRef=useRef<Item|null>(null),callbacks=useRef<{onStep:(n:number[],l:number[],r:number[])=>void;onFinish:()=>void;velocity:number}|null>(null),index=useRef(0);
 const clear=()=>{timers.current.forEach(window.clearTimeout);timers.current=[];};
 const stop=useCallback(()=>{generation.current++;clear();handles.current.forEach(h=>{try{h.stop()}catch{}});handles.current=[];itemRef.current=null;callbacks.current=null;index.current=0;setPlaying(false);setPaused(false);setStepIndex(-1);setStepNotes([]);setStepLabel('');void resumeAudio();},[]);
 const schedule=useCallback((token:number)=>{
  const item=itemRef.current,cb=callbacks.current;if(!item||!cb||token!==generation.current)return;
  if(index.current>=item.steps.length){if(item.loop)index.current=0;else{setPlaying(false);setPaused(false);setStepIndex(-1);setStepNotes([]);setStepLabel('');cb.onFinish();handles.current=[];itemRef.current=null;callbacks.current=null;return;}}
  const i=index.current,step=item.steps[i],beat=60/(item.bpm||90),duration=Math.max(.28,step.beats*beat*.88);
  handles.current.forEach(h=>{try{h.stop()}catch{}});handles.current=[];
  step.notes.forEach(n=>handles.current.push(playNote(n,{duration,velocity:cb.velocity})));
  setStepIndex(i);setStepNotes(step.notes);setStepLabel(step.label||'');cb.onStep(step.notes,step.lh??[],step.rh??step.notes);
  timers.current.push(window.setTimeout(()=>{if(token!==generation.current||!itemRef.current)return;index.current=i+1;schedule(token);},Math.max(.28,step.beats*beat)*1000));
 },[]);
 const play=useCallback((item:Item,onStep:(n:number[],l:number[],r:number[])=>void,onFinish:()=>void,velocity=.5)=>{stop();const token=generation.current;itemRef.current=item;callbacks.current={onStep,onFinish,velocity};index.current=0;setPlaying(true);setPaused(false);schedule(token);},[stop,schedule]);
 const pause=useCallback(()=>{if(!itemRef.current||!playing||paused)return;clear();setPaused(true);void suspendAudio();},[playing,paused]);
 const resume=useCallback(()=>{if(!itemRef.current||!paused)return;void resumeAudio().then(()=>{setPaused(false);const token=generation.current,item=itemRef.current;if(!item)return;const step=item.steps[index.current],wait=step?Math.max(.28,step.beats*60/(item.bpm||90)):0;timers.current.push(window.setTimeout(()=>{if(token!==generation.current)return;index.current++;schedule(token);},wait*1000));});},[paused,schedule]);
 useEffect(()=>()=>{generation.current++;clear();handles.current.forEach(h=>{try{h.stop()}catch{}});},[]);
 return {playing,paused,stepIndex,stepNotes,stepLabel,play,stop,pause,resume};
}