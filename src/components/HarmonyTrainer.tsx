import {useMemo,useState} from 'react';
import {playNote,unlockAudio} from '../lib/pianoAudio';
import {buildHarmonySteps,HARMONY_PROGRESSIONS,HARMONY_PASSING_PATHS,type HarmonyKind} from '../lib/harmonyPractice';

type Props={heldNotes:number[]};
const KEYS=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export default function HarmonyTrainer({heldNotes}:Props){
 const [kind,setKind]=useState<HarmonyKind>('progression');
 const [key,setKey]=useState('F♯');
 const [patternId,setPatternId]=useState('jazz-251');
 const [stepIndex,setStepIndex]=useState(0);
 const patterns=kind==='progression'?HARMONY_PROGRESSIONS:HARMONY_PASSING_PATHS;
 const selected=patterns.find(item=>item.id===patternId)??patterns[0];
 const steps=useMemo(()=>buildHarmonySteps(key,patternId,kind),[key,patternId,kind]);
 const step=steps[Math.min(stepIndex,steps.length-1)];
 const heldPitchClasses=[...new Set(heldNotes.map(n=>n%12))];
 const targetPitchClasses=[...new Set(step.all.map(n=>n%12))];
 const matched=targetPitchClasses.every(pc=>heldPitchClasses.includes(pc));
 const playChord=async()=>{await unlockAudio();step.all.forEach((note,index)=>playNote(note,{when:index<2?0:.015,duration:2.1,velocity:index<2?.34:.48}));};
 const changeKind=(next:HarmonyKind)=>{setKind(next);setPatternId(next==='progression'?'jazz-251':'tritone-resolution');setStepIndex(0);};
 const changePattern=(id:string)=>{setPatternId(id);setStepIndex(0);};
 return <section className="harmony-trainer">
  <div className="harmony-trainer-head"><div><span className="midi-eyebrow">08 · HARMONY WORKSHOP</span><h3>Keys, chords & movement</h3><p>Study chord shapes and how one harmony moves into the next. No staff notation or note-value symbols — just the keys, chord names and hand positions.</p></div><span className="harmony-live-badge">{matched?'CHORD MATCHED':'LISTEN · THEN PLAY'}</span></div>
  <div className="harmony-controls"><div className="harmony-mode-switch"><button className={kind==='progression'?'active':''} onClick={()=>changeKind('progression')}>Progressions</button><button className={kind==='passing'?'active':''} onClick={()=>changeKind('passing')}>Passing chords</button></div><label>KEY<select value={key} onChange={e=>{setKey(e.target.value);setStepIndex(0);}}>{KEYS.map(k=><option key={k}>{k}</option>)}</select></label><label>HARMONY<select value={patternId} onChange={e=>changePattern(e.target.value)}>{patterns.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
  <p className="harmony-description">{selected.description}</p>
  <div className="harmony-step-strip">{steps.map((item,index)=><button key={item.id} className={index===stepIndex?'selected':''} onClick={()=>setStepIndex(index)}><small>{String(index+1).padStart(2,'0')}</small><b>{item.symbol}</b><span>{item.label}</span></button>)}</div>
  <div className="harmony-current"><div className="harmony-current-title"><div><small>CHORD {stepIndex+1} OF {steps.length}</small><h4>{step.symbol}</h4><p>{step.label} · {step.quality}</p></div><button className="midi-primary" onClick={()=>void playChord()}>▶ Hear this chord</button></div>
   <div className="harmony-hands"><div><small>LEFT HAND · BASS SHAPE</small><div>{step.left.map(n=><span key={n}>{KEYS[n%12]}</span>)}</div></div><div><small>RIGHT HAND · CHORD VOICING</small><div>{step.right.map(n=><span key={n}>{KEYS[n%12]}</span>)}</div></div></div>
   <div className="harmony-key-map"><small>KEY MAP · ACTIVE CHORD TONES</small><div>{Array.from({length:24},(_,i)=>48+i).map(n=><span key={n} className={step.all.some(note=>note%12===n%12)?'active':''}>{KEYS[n%12]}</span>)}</div></div>
   <div className={'harmony-match '+(matched?'matched':'')}>{matched?'✓ Correct chord tones detected from your MIDI keyboard.':'Play the chord on your connected MIDI keyboard. Your held keys will be compared with this voicing.'}</div>
   <div className="harmony-navigation"><button className="midi-secondary" disabled={stepIndex===0} onClick={()=>setStepIndex(i=>Math.max(0,i-1))}>← Previous chord</button><button className="midi-primary" disabled={stepIndex===steps.length-1} onClick={()=>setStepIndex(i=>Math.min(steps.length-1,i+1))}>Next chord →</button></div>
  </div>
 </section>;
}
