export const PITCHES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'] as const;
export const KEY_OPTIONS = PITCHES.map((name, pitchClass) => ({ name, pitchClass, alias: ({1:'D♭',3:'E♭',6:'G♭',8:'A♭',10:'B♭'} as Record<number,string>)[pitchClass] ?? '' }));
export type ScaleDefinition = { id:string; name:string; family:string; intervals:number[]; description:string };
export type ChordDefinition = { id:string; name:string; symbol:string; family:string; intervals:number[] };
export const SCALE_TYPES:ScaleDefinition[] = [
 {id:'major',name:'Major / Ionian',family:'Major',intervals:[0,2,4,5,7,9,11],description:'Bright major tonality.'},
 {id:'natural_minor',name:'Natural minor / Aeolian',family:'Minor',intervals:[0,2,3,5,7,8,10],description:'Natural minor scale.'},
 {id:'harmonic_minor',name:'Harmonic minor',family:'Minor',intervals:[0,2,3,5,7,8,11],description:'Minor with a raised leading tone.'},
 {id:'melodic_minor',name:'Melodic minor',family:'Minor',intervals:[0,2,3,5,7,9,11],description:'Jazz melodic minor ascending.'},
 {id:'dorian',name:'Dorian',family:'Modes',intervals:[0,2,3,5,7,9,10],description:'Minor mode with a natural sixth.'},
 {id:'phrygian',name:'Phrygian',family:'Modes',intervals:[0,1,3,5,7,8,10],description:'Minor mode with a flat second.'},
 {id:'lydian',name:'Lydian',family:'Modes',intervals:[0,2,4,6,7,9,11],description:'Major mode with a raised fourth.'},
 {id:'mixolydian',name:'Mixolydian',family:'Modes',intervals:[0,2,4,5,7,9,10],description:'Dominant mode with a flat seventh.'},
 {id:'locrian',name:'Locrian',family:'Modes',intervals:[0,1,3,5,6,8,10],description:'Diminished mode.'},
 {id:'major_pentatonic',name:'Major pentatonic',family:'Pentatonic',intervals:[0,2,4,7,9],description:'Five-note major collection.'},
 {id:'minor_pentatonic',name:'Minor pentatonic',family:'Pentatonic',intervals:[0,3,5,7,10],description:'Five-note minor collection.'},
 {id:'blues',name:'Blues',family:'Blues',intervals:[0,3,5,6,7,10],description:'Minor blues collection.'},
 {id:'whole_tone',name:'Whole tone',family:'Symmetric',intervals:[0,2,4,6,8,10],description:'Symmetric six-note whole-tone scale.'},
 {id:'diminished_whole_half',name:'Diminished whole–half',family:'Symmetric',intervals:[0,2,3,5,6,8,9,11],description:'Symmetric diminished scale.'},
 {id:'altered',name:'Altered dominant',family:'Jazz',intervals:[0,1,3,4,6,8,10],description:'Altered dominant scale.'},
 {id:'bebop_dominant',name:'Bebop dominant',family:'Jazz',intervals:[0,2,4,5,7,9,10,11],description:'Eight-note dominant bebop scale.'},
 {id:'lydian_dominant',name:'Lydian dominant',family:'Jazz',intervals:[0,2,4,6,7,9,10],description:'Dominant sound with a raised fourth.'},
 {id:'phrygian_dominant',name:'Phrygian dominant',family:'World / Modal',intervals:[0,1,4,5,7,8,10],description:'Major third over a Phrygian frame.'}
];
export const CHORD_TYPES:ChordDefinition[] = [
 {id:'major',name:'Major triad',symbol:'',family:'Triads',intervals:[0,4,7]},
 {id:'minor',name:'Minor triad',symbol:'m',family:'Triads',intervals:[0,3,7]},
 {id:'diminished',name:'Diminished triad',symbol:'dim',family:'Triads',intervals:[0,3,6]},
 {id:'augmented',name:'Augmented triad',symbol:'aug',family:'Triads',intervals:[0,4,8]},
 {id:'sus2',name:'Suspended second',symbol:'sus2',family:'Suspended',intervals:[0,2,7]},
 {id:'sus4',name:'Suspended fourth',symbol:'sus4',family:'Suspended',intervals:[0,5,7]},
 {id:'major6',name:'Major sixth',symbol:'6',family:'Sixths',intervals:[0,4,7,9]},
 {id:'minor6',name:'Minor sixth',symbol:'m6',family:'Sixths',intervals:[0,3,7,9]},
 {id:'dominant7',name:'Dominant seventh',symbol:'7',family:'Sevenths',intervals:[0,4,7,10]},
 {id:'major7',name:'Major seventh',symbol:'maj7',family:'Sevenths',intervals:[0,4,7,11]},
 {id:'minor7',name:'Minor seventh',symbol:'m7',family:'Sevenths',intervals:[0,3,7,10]},
 {id:'half_diminished7',name:'Half-diminished seventh',symbol:'m7♭5',family:'Sevenths',intervals:[0,3,6,10]},
 {id:'diminished7',name:'Diminished seventh',symbol:'dim7',family:'Sevenths',intervals:[0,3,6,9]},
 {id:'minor9',name:'Minor ninth',symbol:'m9',family:'Extensions',intervals:[0,3,7,10,14]},
 {id:'major9',name:'Major ninth',symbol:'maj9',family:'Extensions',intervals:[0,4,7,11,14]},
 {id:'dominant9',name:'Dominant ninth',symbol:'9',family:'Extensions',intervals:[0,4,7,10,14]},
 {id:'dominant11',name:'Dominant eleventh',symbol:'11',family:'Extensions',intervals:[0,4,7,10,14,17]},
 {id:'dominant13',name:'Dominant thirteenth',symbol:'13',family:'Extensions',intervals:[0,4,7,10,14,21]},
 {id:'dominant7b9',name:'Dominant flat ninth',symbol:'7♭9',family:'Altered',intervals:[0,4,7,10,13]},
 {id:'dominant7sharp9',name:'Dominant sharp ninth',symbol:'7♯9',family:'Altered',intervals:[0,4,7,10,15]},
 {id:'add9',name:'Add ninth',symbol:'add9',family:'Added tones',intervals:[0,4,7,14]},
 {id:'quartal',name:'Quartal stack',symbol:'quartal',family:'Modern',intervals:[0,5,10,15]}
];
export const PROGRESSION_TEMPLATES = [
 {id:'jazz251',name:'Jazz ii–V–I',style:'Jazz',degrees:['ii7','V7','Imaj7'],description:'Foundational major-key jazz cadence.'},
 {id:'jazz36251',name:'Jazz iii–VI–ii–V–I',style:'Jazz',degrees:['iii7','VI7','ii7','V7','Imaj7'],description:'Extended cycle resolving to tonic.'},
 {id:'gospel',name:'Gospel turnaround',style:'Gospel',degrees:['Imaj7','vi7','ii7','V7'],description:'A common gospel turnaround.'},
 {id:'worship',name:'Worship I–V–vi–IV',style:'Worship',degrees:['I','V','vi','IV'],description:'Contemporary worship movement.'},
 {id:'pop',name:'Pop vi–IV–I–V',style:'Pop',degrees:['vi','IV','I','V'],description:'Common pop progression.'},
 {id:'blues',name:'12-bar blues',style:'Blues',degrees:['I7','I7','I7','I7','IV7','IV7','I7','I7','V7','IV7','I7','V7'],description:'Twelve-bar dominant blues.'}
] as const;
export function pitchName(pc:number):string{return PITCHES[((pc%12)+12)%12];}
export function midiName(midi:number):string{return pitchName(midi)+' '+(Math.floor(midi/12)-1);}
export function makeScale(root:number,scale:ScaleDefinition,octave=4):number[]{const base=(octave+1)*12+root;return scale.intervals.map(i=>base+i).concat(base+12);}
export function makeChord(root:number,chord:ChordDefinition,octave=3):number[]{const base=(octave+1)*12+root;return chord.intervals.map(i=>base+i);}
export function invertChord(notes:number[],inversion:number):number[]{if(!notes.length)return[];const out=[...notes].sort((a,b)=>a-b);const turns=((inversion%out.length)+out.length)%out.length;for(let i=0;i<turns;i++){const n=out.shift()!;out.push(n+12);}return out;}
export function makeVoicing(root:number,chord:ChordDefinition,inversion=0,octave=3){return invertChord(makeChord(root,chord,octave),inversion);}
export function transposeNotes(notes:number[],semitones:number):number[]{return notes.map(n=>n+semitones);}
export function makeArpeggio(root:number,chord:ChordDefinition,octave=3,direction:'up'|'down'|'up_down'='up_down'):number[]{const up=makeChord(root,chord,octave);if(direction==='up')return [...up,up[0]+12];if(direction==='down')return [...up].reverse();return [...up,up[0]+12,...up.slice(1).reverse()];}
function qualityFromDegree(degree:string):string{const d=degree.replace(/[0-9♭#]/g,'');if(degree.includes('ø')||degree.includes('m7♭5'))return'half_diminished7';if(degree.includes('dim'))return'diminished7';if(d==='ii'||d==='iii'||d==='vi')return degree.includes('7')?'minor7':'minor';if(d==='I'||d==='IV')return degree.includes('maj7')?'major7':'major';if(d==='V'||d==='VI')return degree.includes('7')?'dominant7':'major';return degree.includes('m')?'minor7':'dominant7';}
export function realizeProgression(root:number,template:typeof PROGRESSION_TEMPLATES[number],octave=2){const major=[0,2,4,5,7,9,11];return template.degrees.map((degree,index)=>{const roman=degree.replace(/[0-9]/g,'').replace('maj','').replace('♭','').replace('#','');const numeral=roman.toLowerCase();const degreeIndex=({i:0,ii:1,iii:2,iv:3,v:4,vi:5,vii:6}[numeral]??0);const chordType=CHORD_TYPES.find(c=>c.id===qualityFromDegree(degree))??CHORD_TYPES[0];const chordRoot=(root+major[degreeIndex])%12;const notes=makeChord(chordRoot,chordType,3);const bass=(octave+1)*12+chordRoot;return{name: pitchName(chordRoot)+chordType.symbol,left:[bass,bass+7],right:notes.map(n=>n+12),degree,step:index+1};});}
export function makeSlashChord(root:number,chord:ChordDefinition,bassInterval:number,octave=2){const bassPc=(root+bassInterval)%12;const bass=(octave+1)*12+bassPc;const upper=makeChord(root,chord,3);return{symbol:pitchName(root)+chord.symbol+'/'+pitchName(bassPc),bass:[bass],upper};}
