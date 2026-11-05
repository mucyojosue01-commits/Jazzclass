export const HARMONY_PROGRESSIONS = [
 {id:'jazz-251',name:'Jazz ii–V–I',description:'The essential jazz cadence. Hear the minor, dominant and tonic colours resolve.',steps:[{label:'ii',offset:2,quality:'m7',intervals:[0,3,7,10]},{label:'V',offset:7,quality:'7',intervals:[0,4,7,10]},{label:'I',offset:0,quality:'maj7',intervals:[0,4,7,11]}]},
 {id:'jazz-36251',name:'Jazz iii–VI–ii–V–I',description:'A longer cycle of dominant movement resolving to the tonic.',steps:[{label:'iii',offset:4,quality:'m7',intervals:[0,3,7,10]},{label:'VI',offset:9,quality:'7',intervals:[0,4,7,10]},{label:'ii',offset:2,quality:'m7',intervals:[0,3,7,10]},{label:'V',offset:7,quality:'7',intervals:[0,4,7,10]},{label:'I',offset:0,quality:'maj9',intervals:[0,4,7,11,14]}]},
 {id:'gospel-turnaround',name:'Gospel turnaround',description:'A warm tonic-to-six-to-two-to-five movement for gospel and worship playing.',steps:[{label:'I',offset:0,quality:'maj9',intervals:[0,4,7,11,14]},{label:'vi',offset:9,quality:'m7',intervals:[0,3,7,10]},{label:'ii',offset:2,quality:'m9',intervals:[0,3,7,10,14]},{label:'V',offset:7,quality:'13',intervals:[0,4,7,10,14,21]}]},
 {id:'worship-1546',name:'Worship I–V–vi–IV',description:'A familiar contemporary worship progression with clear chord shapes.',steps:[{label:'I',offset:0,quality:'add9',intervals:[0,4,7,14]},{label:'V',offset:7,quality:'sus4',intervals:[0,5,7,10]},{label:'vi',offset:9,quality:'m7',intervals:[0,3,7,10]},{label:'IV',offset:5,quality:'maj7',intervals:[0,4,7,11]}]},
 {id:'blues-145',name:'Blues I–IV–V',description:'A dominant-seventh blues foundation for comping and improvisation.',steps:[{label:'I',offset:0,quality:'7',intervals:[0,4,7,10]},{label:'IV',offset:5,quality:'7',intervals:[0,4,7,10]},{label:'V',offset:7,quality:'7',intervals:[0,4,7,10]}]},
 {id:'minor-251',name:'Minor iiø–V–i',description:'A core minor-key jazz cadence with half-diminished and altered dominant colour.',steps:[{label:'iiø',offset:2,quality:'m7♭5',intervals:[0,3,6,10]},{label:'V7♭9',offset:7,quality:'7♭9',intervals:[0,4,7,10,13]},{label:'i',offset:0,quality:'m9',intervals:[0,3,7,10,14]}]}
] as const;

export const HARMONY_PASSING_PATHS = [
 {id:'tritone-resolution',name:'Tritone substitution into I',description:'Replace the V7 with a dominant chord a tritone away, then resolve to the tonic.',steps:[{label:'bII7',offset:1,quality:'7',intervals:[0,4,7,10]},{label:'#Idim7',offset:1,quality:'dim7',intervals:[0,3,6,9]},{label:'I',offset:0,quality:'maj7',intervals:[0,4,7,11]}]},
 {id:'secondary-dominant-ii',name:'Secondary dominant into ii',description:'Use VI7 to pull strongly into the ii minor chord before continuing to V and I.',steps:[{label:'VI7',offset:9,quality:'7',intervals:[0,4,7,10]},{label:'ii7',offset:2,quality:'m7',intervals:[0,3,7,10]},{label:'V7',offset:7,quality:'7',intervals:[0,4,7,10]},{label:'Imaj7',offset:0,quality:'maj7',intervals:[0,4,7,11]}]},
 {id:'chromatic-diminished',name:'Chromatic diminished approach',description:'A diminished passing chord sits one semitone above the destination and creates smooth voice-leading.',steps:[{label:'Imaj7',offset:0,quality:'maj7',intervals:[0,4,7,11]},{label:'#Idim7',offset:1,quality:'dim7',intervals:[0,3,6,9]},{label:'ii7',offset:2,quality:'m7',intervals:[0,3,7,10]}]},
 {id:'dominant-chain',name:'Dominant chain into tonic',description:'A chain of secondary dominants creates forward motion through the harmony.',steps:[{label:'III7',offset:4,quality:'7',intervals:[0,4,7,10]},{label:'VI7',offset:9,quality:'7',intervals:[0,4,7,10]},{label:'II7',offset:2,quality:'7',intervals:[0,4,7,10]},{label:'V7',offset:7,quality:'7',intervals:[0,4,7,10]},{label:'Imaj7',offset:0,quality:'maj7',intervals:[0,4,7,11]}]},
 {id:'minor-approach',name:'Minor colour into tonic',description:'Use a minor iv sound and a dominant approach to enrich a major-key resolution.',steps:[{label:'ivm6',offset:5,quality:'m6',intervals:[0,3,7,9]},{label:'bVII7',offset:10,quality:'7',intervals:[0,4,7,10]},{label:'I6/9',offset:0,quality:'6/9',intervals:[0,4,7,9,14]}]}
] as const;

export type HarmonyKind='progression'|'passing';
export type HarmonyStep={id:string;label:string;symbol:string;root:number;quality:string;left:number[];right:number[];all:number[];};

export function buildHarmonySteps(key:string,id:string,kind:HarmonyKind='progression'):HarmonyStep[]{
 const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
 const aliases:Record<string,number>={'D♭':1,'E♭':3,'G♭':6,'A♭':8,'B♭':10};
 const tonic=names.indexOf(key)>=0?names.indexOf(key):(aliases[key]??0);
 const collection=kind==='passing'?HARMONY_PASSING_PATHS:HARMONY_PROGRESSIONS;
 const pattern=collection.find(item=>item.id===id)??collection[0];
 return pattern.steps.map((step,index)=>{
  const root=(tonic+step.offset)%12;
  const left=[36+root,43+root];
  const right=step.intervals.map(interval=>60+root+interval);
  return {id:pattern.id+'-'+index,label:step.label,symbol:names[root]+step.quality,root,quality:step.quality,left,right,all:[...left,...right]};
 });
}
