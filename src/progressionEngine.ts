import type { ProgressionStepRecord } from './lib/musicRepository';

const PITCH_CLASSES: Record<string, number> = {
  C:0, 'C♯':1, 'D♭':1, D:2, 'D♯':3, 'E♭':3, E:4, F:5,
  'E♯':5, 'F♯':6, 'G♭':6, G:7, 'G♯':8, 'A♭':8, A:9,
  'A♯':10, 'B♭':10, B:11, 'C♭':11
};
const MAJOR_SCALE = [0,2,4,5,7,9,11];
const DEGREE: Record<string,number> = { I:0, II:1, III:2, IV:3, V:4, VI:5, VII:6 };
const NOTE_NAMES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const pc = (value:number) => ((value % 12) + 12) % 12;
const midiName = (value:number) => NOTE_NAMES[pc(value)] + (Math.floor(value / 12) - 1);

export type ProgressionVoicingOptions = {
  key:string;
  style?:string;
  leftShape:'two'|'three';
  hands:'right'|'left'|'both';
  inversion:number;
  inversionMode:'right'|'both';
  leftOctave:boolean;
  rightOctave:boolean;
  slashEnabled:boolean;
};
export type RealizedProgressionStep = { name:string; lh:string[]; rh:string[]; beats:number };

type ParsedRoman = { degree:number; accidental:number; suffix:string; slashDegree:number|null };

function parseRoman(symbol:string):ParsedRoman {
  const normalized = symbol.trim().replace(/♭/g,'b').replace(/♯/g,'#');
  const match = normalized.match(/^([b#]*)(VII|VI|IV|V|III|II|I)(.*)$/i);
  if (!match) return { degree:0, accidental:0, suffix:'', slashDegree:null };
  const accidental = [...match[1]].reduce((sum,char)=>sum+(char==='b'?-1:1),0);
  const suffix = match[3] ?? '';
  const slashMatch = suffix.match(/\/(b|#)?(VII|VI|IV|V|III|II|I)$/i);
  const slashDegree = slashMatch
    ? pc(MAJOR_SCALE[DEGREE[slashMatch[2].toUpperCase()] ?? 0] + (slashMatch[1]==='b'?-1:slashMatch[1]==='#'?1:0))
    : null;
  return { degree:DEGREE[match[2].toUpperCase()] ?? 0, accidental, suffix:suffix.replace(/\/(?:b|#)?(?:VII|VI|IV|V|III|II|I)$/i,''), slashDegree };
}

function qualityIntervals(quality:string, suffix:string):number[] {
  const q=quality.toLowerCase(), s=suffix.toLowerCase();
  if (q.includes('half_diminished') || s.includes('ø')) return [0,3,6,10];
  if (q.includes('diminished7') || /dim7/.test(s)) return [0,3,6,9];
  if (q.includes('diminished') || /dim/.test(s)) return [0,3,6];
  if (q.includes('augmented') || s.includes('+')) return [0,4,8];
  if (s.includes('sus4') || q.includes('sus4')) return [0,5,7,10];
  if (s.includes('sus2') || q.includes('sus2')) return [0,2,7,10];
  if (s.includes('alt') || q.includes('altered')) return [0,4,10,13,15];
  if (s.includes('b9') || s.includes('♭9')) return [0,4,7,10,13];
  if (s.includes('#9') || s.includes('♯9')) return [0,4,7,10,15];
  if (s.includes('#11') || s.includes('♯11')) return [0,4,7,10,14,18];
  if (s.includes('b13') || s.includes('♭13')) return [0,4,7,10,14,20];
  if (/m(aj)?9/.test(s) || q.includes('minor9')) return s.startsWith('maj') ? [0,4,7,11,14] : [0,3,7,10,14];
  if (/m7/.test(s) || q.includes('minor7')) return [0,3,7,10];
  if (s.includes('maj7') || q.includes('major7')) return [0,4,7,11];
  if (s.includes('add2') || s.includes('add9') || q.includes('add2')) return [0,2,4,7];
  if (s.includes('13') || q.includes('dominant13')) return [0,4,7,10,14,21];
  if (s.includes('11') || q.includes('dominant11')) return [0,4,7,10,14,17];
  if (s.includes('9') || q.includes('dominant9')) return [0,4,7,10,14];
  if (s.includes('6') || q.includes('major6')) return [0,4,7,9];
  if (q.includes('dominant7') || q==='7' || s.endsWith('7')) return [0,4,7,10];
  if (q==='minor' || s==='m') return [0,3,7];
  if (q==='major' || !q) return [0,4,7];
  return [0,4,7];
}

function nearestPitch(pitchClass:number, reference:number, min:number, max:number):number {
  let best=min, bestDistance=Infinity;
  for(let n=min;n<=max;n++) if(pc(n)===pc(pitchClass)) {
    const distance=Math.abs(n-reference);
    if(distance<bestDistance){best=n;bestDistance=distance;}
  }
  return best;
}

/** Find a compact, ascending register for the requested chord tones while minimizing movement. */
function voiceLead(pitchClasses:number[], previous:number[]):number[] {
  const pcs=pitchClasses.map(pc);
  const candidates=pcs.map((pitchClass,index)=>{
    const reference=previous[index] ?? (index===0?64:previous[previous.length-1] ?? 69);
    const list:number[]=[];
    for(let n=48;n<=88;n++) if(pc(n)===pitchClass) list.push(n);
    return list.sort((a,b)=>Math.abs(a-reference)-Math.abs(b-reference));
  });
  let best:number[]=[];
  let bestCost=Infinity;
  const visit=(index:number, chosen:number[])=>{
    if(index===candidates.length){
      const span=chosen[chosen.length-1]-chosen[0];
      const movement=chosen.reduce((sum,n,i)=>sum+Math.abs(n-(previous[i] ?? 66)),0);
      const cost=movement+Math.max(0,span-19)*1.8+(span<5?8:0);
      if(cost<bestCost){bestCost=cost;best=[...chosen];}
      return;
    }
    for(const n of candidates[index]){
      if(index>0 && n<=chosen[index-1]) continue;
      if(index>0 && n-chosen[0]>28) continue;
      visit(index+1,[...chosen,n]);
    }
  };
  visit(0,[]);
  if(best.length===pcs.length) return best;
  return pcs.map((pitchClass,i)=>nearestPitch(pitchClass,previous[i]??64,48,88)).sort((a,b)=>a-b);
}

function buildRightHand(root:number, formula:number[], quality:string, suffix:string, style:string):number[] {
  // The database formulas are the authored voicing recipe. Use them before any generic genre fallback.
  let intervals=formula.length ? formula : qualityIntervals(quality,suffix);
  if(!formula.length && style.toLowerCase()==='jazz' && intervals.length>=4) {
    const third=intervals.find(n=>n===3||n===4) ?? 4;
    const seventh=intervals.find(n=>n===9||n===10||n===11);
    if(seventh!==undefined) intervals=[third,seventh,14];
  }
  return [...new Set(intervals.map(n=>pc(root+n)))];
}

export function realizeProgression(steps:ProgressionStepRecord[], options:ProgressionVoicingOptions):RealizedProgressionStep[] {
  const tonic=PITCH_CLASSES[options.key] ?? 6;
  let previousRight:number[]=[];
  let previousBass:number|null=null;

  return [...steps].sort((a,b)=>a.step_index-b.step_index).map(step=>{
    const roman=parseRoman(step.roman_numeral);
    const root=pc(tonic+MAJOR_SCALE[roman.degree]+roman.accidental);
    const quality=step.chord_quality || 'major';
    const formula=Array.isArray(step.right_hand_formula) ? step.right_hand_formula : [];
    const rightPitchClasses=buildRightHand(root,formula,quality,roman.suffix,options.style??'');
    let right=rightPitchClasses.map(p=>nearestPitch(p,64,48,88)).sort((a,b)=>a-b);

    // Rotate chord tones for the selected inversion, then preserve that ordering during register optimization.
    const inversion=Math.max(0,Math.floor(options.inversion));
    for(let i=0;i<inversion%Math.max(1,right.length);i++){
      const lowest=right.shift();
      if(lowest!==undefined) right.push(lowest+12);
    }
    right=voiceLead(right.map(pc),previousRight);
    if(options.rightOctave && right.length) right=[...right,right[0]+12];

    const bassChoices=[root,pc(root+7),pc(root+(quality.toLowerCase().includes('minor')?3:4))];
    const slashPc=roman.slashDegree===null?null:pc(tonic+roman.slashDegree);
    let bassPc=slashPc ?? root;
    if(options.slashEnabled && slashPc===null && previousBass!==null){
      bassPc=bassChoices.map(p=>nearestPitch(p,previousBass!,28,52))
        .sort((a,b)=>Math.abs(a-previousBass!)-Math.abs(b-previousBass!))[0]%12;
    }
    let bass=nearestPitch(bassPc,previousBass??36+bassPc,28,52);
    previousBass=bass;

    let left=options.leftShape==='three'?[bass,bass+7,bass+12]:[bass,bass+7];
    if(options.inversionMode==='both' && inversion>0){
      for(let i=0;i<inversion%left.length;i++){
        const lowest=left.shift();
        if(lowest!==undefined) left.push(lowest+12);
      }
      left.sort((a,b)=>a-b);
    }
    if(options.leftOctave) left=[left[0]-12,...left];

    if(options.hands==='right') left=[];
    if(options.hands==='left') right=[];
    if(options.hands!=='left') previousRight=right.filter(n=>n>=48&&n<=88);

    const bassName=midiName(bass);
    return {
      name:step.roman_numeral+' · '+quality+(bassPc!==root?' / '+bassName:''),
      lh:left.map(midiName),
      rh:right.map(midiName),
      beats:Math.max(0.25,Number(step.beats)||2)
    };
  });
}
