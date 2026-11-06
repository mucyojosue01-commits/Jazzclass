export type PitchAssessment = {
  score:number; precision:number; recall:number; f1:number; pitchClassScore:number;
  matched:number[]; missing:number[]; extra:number[];
};
const uniqueSorted=(notes:number[])=>[...new Set(notes.filter(n=>Number.isInteger(n)&&n>=0&&n<=127))].sort((a,b)=>a-b);
const percent=(value:number)=>Math.round(value*100);
export function assessPitchSet(targetNotes:number[],playedNotes:number[]):PitchAssessment {
  const target=uniqueSorted(targetNotes),played=uniqueSorted(playedNotes);
  const targetSet=new Set(target),playedSet=new Set(played);
  const matched=target.filter(n=>playedSet.has(n));
  const missing=target.filter(n=>!playedSet.has(n));
  const extra=played.filter(n=>!targetSet.has(n));
  const precision=played.length?matched.length/played.length:0;
  const recall=target.length?matched.length/target.length:0;
  const f1=precision+recall?2*precision*recall/(precision+recall):0;
  const targetPc=new Set(target.map(n=>n%12)),playedPc=new Set(played.map(n=>n%12));
  const pcMatched=[...targetPc].filter(n=>playedPc.has(n)).length;
  const pcPrecision=playedPc.size?pcMatched/playedPc.size:0;
  const pcRecall=targetPc.size?pcMatched/targetPc.size:0;
  const pcF1=pcPrecision+pcRecall?2*pcPrecision*pcRecall/(pcPrecision+pcRecall):0;
  return {score:percent(f1),precision:percent(precision),recall:percent(recall),f1:percent(f1),pitchClassScore:percent(pcF1),matched,missing,extra};
}
