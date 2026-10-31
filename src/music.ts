export type Lesson={id:string;title:string;sub?:string;category:string;description:string;feel?:string;lh:string[];rh:string[];tip:string;target?:string;notes?:(string|number)[];bpm?:number;steps?:{name:string;lh:string[];rh:string[];beats?:number}[]};
export const pc=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export const pcName = (m:number) => pc[((m % 12) + 12) % 12];
export const midi=(n:string)=>{const m=n.match(/^([A-G](?:♯|♭|𝄪|𝄫)?)(-?\d)$/);if(!m)return 60;const pitch=m[1];const base:Record<string,number>={'C':0,'B♯':0,'D𝄫':0,'C♯':1,'D♭':1,'D':2,'C𝄪':2,'D♯':3,'E♭':3,'F𝄫':3,'E':4,'F♭':4,'E♯':5,'F':5,'E𝄪':6,'F♯':6,'G♭':6,'G':7,'F𝄪':7,'G♯':8,'A♭':8,'A':9,'G𝄪':9,'A♯':10,'B♭':10,'C𝄫':10,'B':11,'C♭':11,'A𝄪':11};return (Number(m[2])+1)*12+(base[pitch]??0)};
export const note=(n:number)=>pc[((n%12)+12)%12]+(Math.floor(n/12)-1);
const scaleDefs=[
['F♯ Major','Major / Ionian',[6,8,10,11,1,3,5],'F♯ major home scale.'],['F♯ Natural Minor','Natural minor / Aeolian',[6,8,9,11,1,2,4],'Relative minor colour.'],['F♯ Harmonic Minor','Harmonic minor',[6,8,9,11,1,2,5],'Raised leading tone for dominant resolution.'],['F♯ Melodic Minor','Jazz melodic minor',[6,8,9,11,1,3,5],'Jazz minor with raised sixth and seventh.'],['F♯ Dorian','Mode',[6,8,9,11,1,3,4],'Minor with a natural sixth.'],['F♯ Phrygian','Mode',[6,7,9,11,1,2,4],'Dark colour from the flat second.'],['F♯ Lydian','Mode',[6,8,10,0,1,3,5],'Major with a raised fourth.'],['F♯ Mixolydian','Mode',[6,8,10,11,1,3,4],'Dominant major colour.'],['F♯ Locrian','Mode',[6,7,9,11,0,2,4],'Half-diminished scale colour.'],['F♯ Major Pentatonic','Five-note scale',[6,8,10,1,3],'Open melodic sound.'],['F♯ Minor Pentatonic','Five-note scale',[6,9,11,1,4],'Minor blues foundation.'],['F♯ Blues','Six-note blues',[6,9,11,0,1,4],'Minor pentatonic with blue fifth.'],['F♯ Chromatic','Chromatic · 12 notes',[6,7,8,9,10,11,0,1,2,3,4,5],'Every semitone in the octave, resolving to F♯.']
] as const;
export const scales=scaleDefs.map(([title,category,pcs,description],i)=>({id:'scale-'+i,title,category,description,lh:['F♯2','C♯3'],rh:[...pcs.map(p=>note(66+((p-6+12)%12))),note(78)],tip:'Play evenly at a relaxed tempo. Hear the tonic first, then practise short 3–4 note phrases rather than rushing through the scale.',notes:pcs.map(p=>pc[p])}));
const degreeSevenths=['F♯maj7','G♯m7','A♯m7','Bmaj7','C♯7','D♯m7','E♯m7♭5'];
export const chordScales=[
{id:'cs-major',title:'F♯ Major harmonised',category:'Chord-scale family',description:'Diatonic seventh chords: F♯maj7 · G♯m7 · A♯m7 · Bmaj7 · C♯7 · D♯m7 · E♯m7♭5.',lh:['F♯2','C♯3'],rh:['A♯4','E♯5','G♯5'],tip:'Play the full chord on each degree. Learn the triad family first, then seventh chords; these are the diatonic harmonies of F♯ major.',notes:['F♯maj7','G♯m7','A♯m7','Bmaj7','C♯7','D♯m7','E♯m7♭5'],steps:[{name:'F♯maj7',lh:['F♯2','C♯3'],rh:['A♯4','E♯5','G♯5']},{name:'G♯m7',lh:['G♯2','D♯3'],rh:['B4','F♯5','A♯5']},{name:'A♯m7',lh:['A♯2','E♯3'],rh:['C♯5','G♯5','B♯5']},{name:'Bmaj7',lh:['B1','F♯2'],rh:['A♯4','D♯5','F♯5']},{name:'C♯7',lh:['C♯2','G♯2'],rh:['E♯4','B4','D♯5']},{name:'D♯m7',lh:['D♯2','A♯2'],rh:['F♯4','C♯5','E♯5']},{name:'E♯m7♭5',lh:['E♯2','B2'],rh:['G♯4','D♯5','F♯5']}]},
{id:'cs-minor',title:'F♯ Natural Minor harmonised',category:'Chord-scale family',description:'F♯m7 · G♯ø7 · Amaj7 · Bm7 · C♯m7 · Dmaj7 · E7.',lh:['F♯2','C♯3'],rh:['A4','E5','G♯5'],tip:'Play each chord as a complete two-hand voicing. The minor family gives a different harmonic palette from F♯ major.',notes:['F♯m7','G♯ø7','Amaj7','Bm7','C♯m7','Dmaj7','E7'],steps:[{name:'F♯m7',lh:['F♯2','C♯3'],rh:['A4','E5','G♯5']},{name:'G♯ø7',lh:['G♯2','D3'],rh:['B4','F♯5','A5']},{name:'Amaj7',lh:['A2','E3'],rh:['C♯5','G♯5','B5']},{name:'Bm7',lh:['B1','F♯2'],rh:['D5','A5','C♯5']},{name:'C♯m7',lh:['C♯2','G♯2'],rh:['E4','B4','D♯5']},{name:'Dmaj7',lh:['D2','A2'],rh:['F♯4','C♯5','E5']},{name:'E7',lh:['E2','B2'],rh:['G♯4','D5','F♯5']}]}
];
export const chords=[
['F♯maj7','F♯2 C♯3','A♯4 C♯5 E♯5','Tonic major seventh.'],['G♯m7','G♯2 D♯3','B4 D♯5 F♯5','Jazz ii chord.'],['A♯m7','A♯2 E♯3','C♯5 E♯5 G♯5','Minor third-degree chord.'],['Bmaj7','B2 F♯3','A♯4 D♯5 F♯5','Warm subdominant.'],['C♯7','C♯2 G♯3','B4 E♯5 G♯5','Dominant V7 resolving to F♯.'],['D♯m7','D♯2 A♯3','F♯4 A♯4 C♯5','Relative minor.'],['E♯m7♭5','E♯2 B2','G♯4 B4 D♯5','Half-diminished leading chord.'],['F♯m9','F♯2 C♯3','A4 E5 G♯5','Minor ninth colour.'],['Bmaj9','B2 F♯3','A♯4 C♯5 D♯5','Open worship voicing.'],['C♯13','C♯2 G♯3','B4 D♯5 A♯5','Dominant extension.']
].map((x,i)=>({id:'chord-'+i,title:x[0],category:'Chord voicing',description:x[3],lh:x[1].split(' '),rh:x[2].split(' '),tip:'Hear the left-hand foundation and right-hand chord together. Keep the RH notes close enough to sound like one voicing.',notes:[...x[1].split(' '),...x[2].split(' ')]}));
const harmonyDefs = [
 {id:'thirds',title:'Harmonised Thirds',sub:'Two-note harmony',feel:'The classic warm harmony — play the pairs together.',pairs:[[54,58],[56,59],[58,61],[59,63],[61,65],[63,66],[65,68]]},
 {id:'sixths',title:'Harmonised Sixths',sub:'Wide and singing',feel:'The same idea an octave-and-a-third wider.',pairs:[[54,63],[56,65],[58,66],[59,68],[61,70],[63,71],[65,73]]},
 {id:'fifths',title:'Open Fifths',sub:'Power chords',feel:'Root plus fifth — open, strong and stable.',pairs:[[54,61],[56,63],[58,65],[59,66],[61,68]]},
];
export const harmonies:Lesson[] = harmonyDefs.map(h=>({
 id:'harmony-'+h.id,title:h.title,sub:h.sub,category:'Harmony',description:h.feel,feel:h.feel,
 lh:[],rh:[],notes:h.pairs.flat().map(n=>note(n)),bpm:84,
 steps:h.pairs.map(pair=>({name:pair.map(pcName).join(' + '),lh:[],rh:pair.map(note),beats:1.5})),
 tip:'Play both notes together and listen to the interval. Keep the sound balanced and move from one pair to the next without rushing.',
}));
export const progressions:Lesson[]=[
{id:'p1',title:'Jazz ii–V–I',category:'Jazz',description:'G♯m7 → C♯7 → F♯maj7',lh:['G♯2','D♯3'],rh:['F♯4','B4','D♯5'],tip:'LH roots and fifths. RH uses guide tones and close voicings. Resolve E♯ to F♯, B to A♯.',steps:[{name:'G♯m7',lh:['G♯2','D♯3'],rh:['F♯4','B4','D♯5']},{name:'C♯7',lh:['C♯2','G♯2'],rh:['E♯4','B4','D♯5']},{name:'F♯maj7',lh:['F♯2','C♯3'],rh:['E♯4','A♯4','C♯5']}]},
{id:'p2',title:'Worship I–V–vi–IV',category:'Worship',description:'F♯ → C♯ → D♯m → B',lh:['F♯2','C♯3'],rh:['A♯4','C♯5','F♯5'],tip:'LH root–fifth–octave pulse. RH uses compact inversions. Leave bass space and let RH carry colour.',steps:[{name:'F♯',lh:['F♯2','C♯3','F♯3'],rh:['A♯4','C♯5','F♯5']},{name:'C♯',lh:['C♯2','G♯2','C♯3'],rh:['G♯4','C♯5','E♯5']},{name:'D♯m',lh:['D♯2','A♯2','D♯3'],rh:['A♯4','D♯5','F♯5']},{name:'B',lh:['B1','F♯2','B2'],rh:['A♯4','D♯5','F♯5']}]},
{id:'p3',title:'Praise I–IV–V–I',category:'Praise',description:'F♯ → B → C♯7 → F♯',lh:['F♯2','C♯3'],rh:['A♯4','C♯5','F♯5'],tip:'Use a firm LH root–fifth–octave pulse. RH can answer vocal phrases with short chord-tone fills.',steps:[{name:'F♯',lh:['F♯2','C♯3','F♯3'],rh:['A♯4','C♯5','F♯5']},{name:'B',lh:['B1','F♯2','B2'],rh:['A♯4','D♯5','F♯5']},{name:'C♯7',lh:['C♯2','G♯2','C♯3'],rh:['B4','E♯5','G♯5']},{name:'F♯',lh:['F♯2','C♯3','F♯3'],rh:['A♯4','C♯5','F♯5']}]},
{id:'p4',title:'Pop vi–IV–I–V',category:'Pop',description:'D♯m → B → F♯ → C♯',lh:['D♯2','A♯2'],rh:['F♯4','A♯4','D♯5'],tip:'Use the nearest inversion each time. Keep the RH top note moving smoothly.',steps:[{name:'D♯m',lh:['D♯2','A♯2'],rh:['F♯4','A♯4','D♯5']},{name:'B',lh:['B1','F♯2'],rh:['F♯4','B4','D♯5']},{name:'F♯',lh:['F♯2','C♯3'],rh:['F♯4','A♯4','C♯5']},{name:'C♯',lh:['C♯2','G♯2'],rh:['E♯4','G♯4','C♯5']}]},
{id:'p5',title:'Gospel turnaround',category:'Gospel',description:'F♯maj7 → D♯m7 → G♯m7 → C♯7',lh:['F♯2','C♯3'],rh:['A♯4','E♯5','G♯5'],tip:'Use LH roots and fifths; RH guide tones plus 9ths. A chromatic pickup can lead into F♯.',steps:[{name:'F♯maj7',lh:['F♯2','C♯3'],rh:['A♯4','E♯5','G♯5']},{name:'D♯m7',lh:['D♯2','A♯2'],rh:['F♯4','C♯5','E♯5']},{name:'G♯m7',lh:['G♯2','D♯3'],rh:['B4','F♯5','A♯5']},{name:'C♯7',lh:['C♯2','G♯2'],rh:['E♯4','B4','D♯5']}]}
];

export const slashChords:Lesson[] = [
 {id:'slash-jazz',title:'Jazz slash-chord colour',category:'Jazz',description:'Smooth upper structures over moving bass notes.',lh:['A♯2'],rh:['F♯3','A♯3','C♯4'],tip:'Keep the slash bass in the left hand and play the complete chord shape together in the right hand.',steps:[
  {name:'F♯/A♯',lh:['A♯2'],rh:['F♯3','A♯3','C♯4']},{name:'G♯m7/C♯',lh:['C♯3'],rh:['F♯3','G♯3','B3','D♯4']},{name:'C♯7/E♯',lh:['E♯2'],rh:['G♯3','B3','C♯4','E♯4']},{name:'F♯maj7/A♯',lh:['A♯2'],rh:['F♯3','A♯3','C♯4','E♯4']}]},
 {id:'slash-worship',title:'Worship slash-chord lift',category:'Worship',description:'A smooth bass line under open worship voicings.',lh:['A♯2'],rh:['F♯3','A♯3','C♯4'],tip:'Let the bass note define the inversion while the right hand holds a warm, connected voicing.',steps:[
  {name:'F♯/A♯',lh:['A♯2'],rh:['F♯3','A♯3','C♯4']},{name:'B/C♯',lh:['C♯3'],rh:['F♯3','B3','D♯4']},{name:'D♯m/A♯',lh:['A♯2'],rh:['F♯3','A♯3','D♯4']},{name:'B/F♯',lh:['F♯2'],rh:['F♯3','B3','D♯4']}]},
 {id:'slash-praise',title:'Praise passing bass',category:'Praise',description:'Forward-moving inversions for energetic praise.',lh:['C♯3'],rh:['F♯3','A♯3','C♯4'],tip:'Play the bass note clearly, then strike the right-hand chord tones together on the beat.',steps:[
  {name:'F♯/C♯',lh:['C♯3'],rh:['F♯3','A♯3','C♯4']},{name:'D♯m/A♯',lh:['A♯2'],rh:['F♯3','A♯3','D♯4']},{name:'B/F♯',lh:['F♯2'],rh:['F♯3','B3','D♯4']},{name:'C♯/G♯',lh:['G♯2'],rh:['G♯3','C♯4','E♯4']}]},
 {id:'slash-gospel',title:'Gospel walk-up slash chords',category:'Gospel',description:'Bass-led gospel movement with compact upper voicings.',lh:['A♯2'],rh:['F♯3','A♯3','C♯4'],tip:'Keep the left-hand bass line deliberate and let the right-hand chord land as one sound.',steps:[
  {name:'F♯/A♯',lh:['A♯2'],rh:['F♯3','A♯3','C♯4']},{name:'G♯m7/B',lh:['B2'],rh:['F♯3','G♯3','B3','D♯4']},{name:'B/C♯',lh:['C♯3'],rh:['F♯3','B3','D♯4']},{name:'C♯7/E♯',lh:['E♯2'],rh:['G♯3','B3','C♯4','E♯4']}]}
];
\nconst roots:number[]=[6,8,11,1,3];
const motifDefs=[['Upper neighbour turn',[0,2,1,0],'Turn around the chord root with a light upper neighbour.'],['Dominant enclosure',[7,10,11,9],'Approach a guide tone from above and below, then resolve.'],['Gospel pickup',[4,5,9],'Short three-note pickup into the tonic chord.'],['Minor chord answer',[0,3,7,10],'Outline the minor seventh sound; leave space after the phrase.'],['Major 6/9 sparkle',[0,4,7,9,11],'A short chord-tone phrase with a gentle sixth colour.'],['Chromatic lower approach',[2,1,0],'Resolve the semitone into the target chord tone on the beat.'],['Dominant 9 fragment',[4,7,10,14],'Use the 3rd, 5th, flat 7th and 9th of the dominant.'],['Descending chord tones',[11,7,4,0],'Fall through chord tones rather than running the scale.'],['Double-note answer',[0,4,7,4],'A compact repeated contour suitable between vocal lines.'],['Jazz turnaround tag',[7,9,10,11,0],'A five-note tag; keep it relaxed and resolve clearly.']];
export const runs:Lesson[]=motifDefs.flatMap((m,i)=>roots.concat([6,10,5,2,9]).map((r,j)=>{const root=(r+(j>4?j-4:0))%12;const seq=(m[1] as number[]).map(k=>note(58+root+k));const leftSeq=seq.map(n=>note(midi(n)-12));return{id:'lick-'+(i*10+j+1),title:String(m[0])+' · '+pc[root]+' ('+(i*10+j+1)+')',category:'Run & lick · '+(i+1),description:'Short chord-tone connector played by the left hand in F♯-centred harmony.',lh:leftSeq,rh:[],notes:leftSeq,tip:String(m[2])+' LEFT HAND: '+leftSeq.join(' – ')+'. Play as relaxed eighth-notes; land the final note on the next chord or strong beat.',target:pc[(root+7)%12]};}));

export const KEYBOARD_LOW = 36; // C2 — includes the bass register used by left-hand patterns
export const KEYBOARD_HIGH = 84; // C6

export const keyNotes = [
 {degree:'1',label:'Tonic',interval:0,role:'Home. Every phrase wants to land here.'},
 {degree:'2',label:'Supertonic',interval:2,role:'Steps away from home — gentle motion.'},
 {degree:'3',label:'Mediant',interval:4,role:'The note that makes the scale sound major.'},
 {degree:'4',label:'Subdominant',interval:5,role:'Lift. Pairs with the tonic to open things up.'},
 {degree:'5',label:'Dominant',interval:7,role:'The strong, stable pillar of the key.'},
 {degree:'6',label:'Submediant',interval:9,role:'Sweet and slightly wistful.'},
 {degree:'7',label:'Leading tone',interval:11,role:'Wants to resolve upward to F♯.'},
].map(n=>({...n,midi:54+n.interval,name:pcName(54+n.interval)}));

const arpDefs = [
 ['F♯ Major','F♯',[0,4,7,12]],
 ['F♯ Minor','F♯m',[0,3,7,12]],
 ['F♯ Major 7','F♯maj7',[0,4,7,11,12]],
 ['F♯ Minor 7','F♯m7',[0,3,7,10,12]],
 ['F♯ Dominant 7','F♯7',[0,4,7,10,12]],
 ['F♯ Diminished','F♯dim',[0,3,6,12]],
 ['F♯ Minor 9','F♯m9',[0,3,7,10,14,12]],
] as const;
export const arpeggios:Lesson[] = arpDefs.map(([title,sub,ints],i)=>{
 const up=ints.map(n=>note(66+n));
 const sequence=[...up,...up.slice(0,-1).reverse()];
 return {id:'arp-'+i,title,sub,category:'Arpeggio',description:'Root to top and back down, one note at a time.',feel:'Hear each chord tone clearly. Keep the movement even and connected.',lh:[],rh:sequence,notes:sequence,bpm:88,tip:'Keep every note even. Listen for the chord quality as the notes rise, then return without rushing.'};
});

export const tips = [
 {title:'F♯ major is mostly black keys',body:'Six of its seven notes sit on black keys. Rest your hand and let the black keys guide you — only B is white. That shape is easy to memorise.'},
 {title:'Anchor on F♯',body:'Find F♯ before you begin. Hear it as home, then practise moving away from it and returning with control.'},
 {title:'Land on the tonic',body:'Whenever a phrase feels unfinished, it is probably waiting for F♯. Try ending short runs on the tonic and hear how it settles.'},
 {title:'Two beats per chord is plenty',body:'Keep each chord steady. Loop one progression slowly until the changes feel automatic before increasing the tempo.'},
 {title:'Use inversions to connect chords',body:'Choose the nearest inversion instead of jumping to a distant shape. Smooth voice leading makes a progression sound intentional.'},
 {title:'Slow is the fast way',body:'If a run falls apart, halve the speed instead of pushing through. Clean, even playing builds the control that speed later borrows.'},
 {title:'Listen before you look',body:'Play a progression, hum the line you hear, then find those notes on the keyboard. Naming what you hear is a core musical skill.'},
 {title:'Leave space in your fills',body:'A good run answers the music; it does not compete with it. Keep phrases short, resolve clearly and leave room for the singer or melody.'},
];
