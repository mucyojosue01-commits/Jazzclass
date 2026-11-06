export type MidiLessonProgress={attempts:number;bestScore:number;lastScore:number;lastPracticed:string|null;totalPracticeSeconds:number;weakPitchClasses:number[];weakPitchClassCounts:Record<number,number>;mastered:boolean};
export type MidiProgress={version:1;lessons:Record<string,MidiLessonProgress>;totalPracticeSeconds:number;totalAttempts:number;lastPracticed:string|null};
export type MidiStorage={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
export type MidiProgressSummary={totalLessons:number;attemptedLessons:number;masteredLessons:number;averageBestScore:number;totalAttempts:number;totalPracticeSeconds:number;lastPracticed:string|null};
const KEY='jazzclass.midi-progress.v1';
const freshRecord=():MidiLessonProgress=>({attempts:0,bestScore:0,lastScore:0,lastPracticed:null,totalPracticeSeconds:0,weakPitchClasses:[],weakPitchClassCounts:{},mastered:false});
export function createMidiProgress():MidiProgress{return{version:1,lessons:{},totalPracticeSeconds:0,totalAttempts:0,lastPracticed:null};}
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:0));
export function normalizeMidiProgress(input:unknown):MidiProgress{
 const raw=input&&typeof input==='object'?input as Record<string,unknown>:{};
 const source=raw.lessons&&typeof raw.lessons==='object'?raw.lessons as Record<string,unknown>:{};
 const lessons:Record<string,MidiLessonProgress>={};
 for(const [id,value] of Object.entries(source)){
  const r=value&&typeof value==='object'?value as Record<string,unknown>:{};
  lessons[id]={attempts:Math.floor(clamp(Number(r.attempts),0,1000000)),bestScore:Math.round(clamp(Number(r.bestScore),0,100)),lastScore:Math.round(clamp(Number(r.lastScore),0,100)),lastPracticed:typeof r.lastPracticed==='string'?r.lastPracticed:null,totalPracticeSeconds:Math.floor(clamp(Number(r.totalPracticeSeconds),0,1e9)),weakPitchClasses:Array.isArray(r.weakPitchClasses)?[...new Set(r.weakPitchClasses.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<12))]:[],weakPitchClassCounts:(()=>{const counts=r.weakPitchClassCounts&&typeof r.weakPitchClassCounts==='object'?r.weakPitchClassCounts as Record<string,unknown>:{};const entries=Object.entries(counts).filter(([pc,value])=>Number.isInteger(Number(pc))&&Number(pc)>=0&&Number(pc)<12&&Number(value)>0);return entries.length?Object.fromEntries(entries.map(([pc,value])=>[Number(pc),Math.floor(clamp(Number(value),0,1000000))])):Object.fromEntries((Array.isArray(r.weakPitchClasses)?r.weakPitchClasses:[]).map(Number).filter(pc=>Number.isInteger(pc)&&pc>=0&&pc<12).map(pc=>[pc,1]));})(),mastered:Boolean(r.mastered)||Number(r.bestScore)>=85};
 }
 return{version:1,lessons,totalPracticeSeconds:Math.floor(clamp(Number(raw.totalPracticeSeconds),0,1e9)),totalAttempts:Math.floor(clamp(Number(raw.totalAttempts),0,1e9)),lastPracticed:typeof raw.lastPracticed==='string'?raw.lastPracticed:null};
}
const getStorage=():MidiStorage|null=>{try{return typeof window!=='undefined'?window.localStorage:null;}catch{return null;}};
export function loadMidiProgress(storage:MidiStorage|null=getStorage()):MidiProgress{
 if(!storage)return createMidiProgress();
 try{const raw=storage.getItem(KEY);return raw?normalizeMidiProgress(JSON.parse(raw)):createMidiProgress();}catch{return createMidiProgress();}
}
export function saveMidiProgress(progress:MidiProgress,storage:MidiStorage|null=getStorage()):void{
 if(!storage)return;try{storage.setItem(KEY,JSON.stringify(normalizeMidiProgress(progress)));}catch{/* storage may be unavailable or full */}
}
export function recordMidiAttempt(progress:MidiProgress,lessonId:string,score:number,playedNotes:number[],targetNotes:number[],practiceSeconds=0):MidiProgress{
 const current=progress.lessons[lessonId]??freshRecord(),now=new Date().toISOString();
 const target=new Set(targetNotes.map(n=>n%12)),played=new Set(playedNotes.map(n=>n%12));
 const weak=[...target].filter(pc=>!played.has(pc));
 const weakCounts={...current.weakPitchClassCounts};
 weak.forEach(pc=>weakCounts[pc]=(weakCounts[pc]??0)+1);
 const weakPitchClasses=Object.entries(weakCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([pc])=>Number(pc));
 const seconds=Math.floor(clamp(practiceSeconds,0,3600));
 const lastScore=Math.round(clamp(score,0,100));
 return{...progress,lessons:{...progress.lessons,[lessonId]:{...current,attempts:current.attempts+1,bestScore:Math.max(current.bestScore,lastScore),lastScore,lastPracticed:now,totalPracticeSeconds:current.totalPracticeSeconds+seconds,weakPitchClasses,weakPitchClassCounts:weakCounts,mastered:current.mastered||lastScore>=85}},totalPracticeSeconds:progress.totalPracticeSeconds+seconds,totalAttempts:progress.totalAttempts+1,lastPracticed:now};
}
export function getMidiProgressSummary(progress:MidiProgress,curriculumSize:number):MidiProgressSummary{
 const records=Object.values(progress.lessons),attempted=records.filter(r=>r.attempts>0);
 return{totalLessons:Math.max(0,Math.floor(curriculumSize)),attemptedLessons:attempted.length,masteredLessons:attempted.filter(r=>r.mastered).length,averageBestScore:attempted.length?Math.round(attempted.reduce((sum,r)=>sum+r.bestScore,0)/attempted.length):0,totalAttempts:progress.totalAttempts,totalPracticeSeconds:progress.totalPracticeSeconds,lastPracticed:progress.lastPracticed};
}
