import type { ProgressionStepRecord } from './lib/musicRepository';
const PC:Record<string,number>={C:0,'C♯':1,D:2,'D♯':3,E:4,F:5,'F♯':6,G:7,'G♯':8,A:9,'A♯':10,B:11};
const SCALE=[0,2,4,5,7,9,11], DEGREE:Record<string,number>={I:0,II:1,III:2,IV:3,V:4,VI:5,VII:6};
export type ProgressionVoicingOptions={key:string;leftShape:'two'|'three';hands:'right'|'left'|'both';inversion:number;inversionMode:'right'|'both';leftOctave:boolean;rightOctave:boolean;slashEnabled:boolean};
export type RealizedProgressionStep={name:string;lh:string[];rh:string[];beats:number};
const pc=(n:number)=>((n%12)+12)%12;
const midiName=(m:number)=>['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][pc(m)]+(Math.floor(m/12)-1);
function parseRoman(symbol:string){
 const clean=symbol.replace(/♭/g,'b').replace(/♯/g,'#');
 const match=clean.match(/^([b#]*)(VII|VI|IV|V|III|II|I)(.*)$/i);
 if(!match)return {degree:0,accidental:0,suffix:'',slash:null as number|null};
 const [,acc,raw,suffixRaw]=match, accidental=(acc.match(/b/g)?.length??0)*-1+(acc.match(/#/g)?.length??0);
 const suffix=suffixRaw??'', sm=suffix.match(/^\/(b|#)?(\d)$/);
 const slash=sm?({1:0,2:2,3:4,4:5,5:7,6:9,7:11}[sm[2]]??0)+(sm[1]==='b'?-1:sm[1]==='#'?1:0):null;
 return {degree:DEGREE[raw.toUpperCase()]??0,accidental,suffix:suffix.replace(/^\/.*$/,''),slash:slash===null?null:pc(slash)};
}
function intervals(qty:string,suffix:string){
 const q=qty.toLowerCase();
 if(/^m(9|7)$/.test(suffix))return suffix==='m9'?[0,3,7,10,14]:[0,3,7,10];
 if(/^m$/.test(suffix))return [0,3,7];
 if(/^maj(9|7)$/.test(suffix))return suffix==='maj9'?[0,4,7,11,14]:[0,4,7,11];
 if(/^add(2|9)$/.test(suffix))return [0,2,4,7];
 if(q.includes('half_diminished'))return [0,3,6,10];
 if(q.includes('diminished7'))return [0,3,6,9];
 if(q.includes('diminished'))return [0,3,6];
 if(q.includes('augmented'))return [0,4,8];
 if(q.includes('sus'))return q.includes('dominant')?[0,5,7,10]:[0,5,7];
 if(q.includes('alt')||suffix.includes('alt'))return [0,4,10,13,15];
 if(q.includes('dominant13')||suffix.includes('13'))return [0,4,10,14,21];
 if(q.includes('dominant9')||suffix.includes('9'))return [0,4,10,14];
 if(q.includes('dominant7')||q==='7')return [0,4,10];
 if(q.includes('major7'))return suffix.includes('9')?[0,4,7,11,14]:[0,4,7,11];
 if(q.includes('minor9'))return [0,3,7,10,14];
 if(q.includes('minor7'))return [0,3,7,10];
 if(q.includes('major6'))return [0,4,7,9];
 if(q==='minor')return [0,3,7];
 if(q==='major')return suffix.includes('add2')||suffix.includes('add9')?[0,2,4,7]:[0,4,7];
 return [0,4,7];
}
function nearest(n:number,ref:number,min=55,max=84){
 const choices:number[]=[];for(let x=min;x<=max;x++)if(pc(x)===pc(n))choices.push(x);
 return choices.sort((a,b)=>Math.abs(a-ref)-Math.abs(b-ref))[0]??n;
}
function lead(notes:number[],previous:number[]){
 if(!previous.length)return notes;
 return notes.map((n,i)=>nearest(n,previous[Math.min(i,previous.length-1)])).sort((a,b)=>a-b);
}
export function realizeProgression(steps:ProgressionStepRecord[],o:ProgressionVoicingOptions):RealizedProgressionStep[]{
 const tonic=PC[o.key]??6;let previousRight:number[]=[],previousBass:number|null=null;
 return steps.map(step=>{
  const r=parseRoman(step.roman_numeral),rootPc=pc(tonic+SCALE[r.degree]+r.accidental),ints=intervals(step.chord_quality,r.suffix);
  const rootMidi=48+rootPc;let rh=ints.map(i=>rootMidi+i).sort((a,b)=>a-b);
  for(let i=0;i<o.inversion%Math.max(1,rh.length);i++){const n=rh.shift()!;rh.push(n+12);}
  rh=lead(rh,previousRight);
  if(o.rightOctave&&rh.length)rh=[...rh,rh[0]+12];
  const chordBassOptions=[rootPc,...ints.slice(1).map(i=>pc(rootPc+i))];
  let bassPc=r.slash===null?rootPc:pc(tonic+r.slash);
  if(o.slashEnabled&&r.slash===null&&previousBass!==null){
   bassPc=chordBassOptions.map(p=>nearest(36+p,previousBass!,28,52)).sort((a,b)=>Math.abs(a-previousBass!)-Math.abs(b-previousBass!))[0]%12;
  }
  const bass=nearest(36+bassPc,previousBass??36+bassPc,28,52);previousBass=bass;
  let lh=o.leftShape==='three'?[bass,bass+7,bass+12]:[bass,bass+7];
  if(o.inversionMode==='both'&&o.inversion>0){for(let i=0;i<o.inversion%lh.length;i++){const n=lh.shift()!;lh.push(n+12);}lh.sort((a,b)=>a-b);}
  if(o.leftOctave)lh=[lh[0]-12,...lh];
  if(o.hands==='right')lh=[];if(o.hands==='left')rh=[];
  if(o.hands!=='left')previousRight=rh.filter(n=>n>=55&&n<=84);
  return {name:step.roman_numeral+' · '+step.chord_quality+(r.slash!==null?' / '+midiName(bass):''),lh:lh.map(midiName),rh:rh.map(midiName),beats:Number(step.beats)||2};
 });
}