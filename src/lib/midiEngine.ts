export type MidiNoteEvent = { note:number; velocity:number; time:number; type:'on'|'off'; channel:number };
export type MidiTake = { name:string; bpm:number; events:MidiNoteEvent[]; duration:number };
export const midiNoteName=(n:number)=>{const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];return names[((n%12)+12)%12]+(Math.floor(n/12)-1);};
export const pitchClass=(n:number)=>((n%12)+12)%12;
const CHORDS:{name:string;intervals:number[]}[]=[
{name:'major',intervals:[0,4,7]},{name:'minor',intervals:[0,3,7]},{name:'diminished',intervals:[0,3,6]},{name:'augmented',intervals:[0,4,8]},{name:'sus2',intervals:[0,2,7]},{name:'sus4',intervals:[0,5,7]},
{name:'maj7',intervals:[0,4,7,11]},{name:'m7',intervals:[0,3,7,10]},{name:'7',intervals:[0,4,7,10]},{name:'m7♭5',intervals:[0,3,6,10]},{name:'dim7',intervals:[0,3,6,9]},{name:'maj9',intervals:[0,4,7,11,14]},{name:'m9',intervals:[0,3,7,10,14]},{name:'9',intervals:[0,4,7,10,14]},{name:'6/9',intervals:[0,4,7,9,14]}
];
export function recognizeChord(notes:number[]):string{
 const pcs=[...new Set(notes.map(pitchClass))].sort((a,b)=>a-b);if(pcs.length<2)return pcs.length?midiNoteName(pcs[0]+60):'—';
 let best:{score:number;label:string}|null=null;
 for(let root=0;root<12;root++)for(const chord of CHORDS){const expected=chord.intervals.map(i=>(root+i)%12).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b);const overlap=pcs.filter(p=>expected.includes(p)).length;const score=overlap/Math.max(pcs.length,expected.length);if(overlap>=Math.min(2,expected.length)&&(!best||score>best.score))best={score,label:midiNoteName(root+60).replace(/\d$/,'')+' '+chord.name};}
 return best&&best.score>=.66?best.label:pcs.map(p=>midiNoteName(p+60).replace(/\d$/,'')).join(' + ');
}
export function buildMidiFile(events:MidiNoteEvent[],bpm=90):Blob{
 const ppq=480,ordered=[...events].sort((a,b)=>a.time-b.time|| (a.type==='off'? -1:1)),bytes:number[]=[];
 const pushVar=(value:number)=>{let buffer=value&0x7f;while((value>>=7))buffer=(buffer<<8)|((value&0x7f)|0x80);while(true){bytes.push(buffer&255);if(buffer&0x80)buffer>>=8;else break;}};
 let lastTick=0;
 for(const e of ordered){const tick=Math.max(lastTick,Math.round(e.time/1000*bpm/60*ppq));pushVar(tick-lastTick);lastTick=tick;bytes.push((e.type==='on'?0x90:0x80)|(e.channel&15),e.note&127,e.type==='on'?Math.max(1,Math.min(127,e.velocity)):0);}
 pushVar(0);bytes.push(0xff,0x2f,0);
 const chunk=(id:string,data:number[])=>[...id.split('').map(c=>c.charCodeAt(0)),(data.length>>>24)&255,(data.length>>>16)&255,(data.length>>>8)&255,data.length&255,...data];
 const tempo=Math.round(60000000/Math.max(30,Math.min(300,bpm)));
 const header=chunk('MThd',[0,1,0,2,(ppq>>8)&255,ppq&255]);
 const tempoTrack=chunk('MTrk',[0,0xff,0x51,3,(tempo>>16)&255,(tempo>>8)&255,tempo&255,0,0xff,0x2f,0]);
 return new Blob([new Uint8Array([...header,...tempoTrack,...chunk('MTrk',bytes)])],{type:'audio/midi'});
}
export function parseMidiFile(buffer:ArrayBuffer):MidiNoteEvent[]{
 const d=new DataView(buffer),u32=(p:number)=>d.getUint32(p),u16=(p:number)=>d.getUint16(p);if(d.byteLength<14||String.fromCharCode(d.getUint8(0),d.getUint8(1),d.getUint8(2),d.getUint8(3))!=='MThd')throw new Error('This is not a Standard MIDI File.');
 const division=u16(12);if(division&0x8000)throw new Error('SMPTE time-division MIDI files are not supported yet.');let p=8+u32(4),tempo=500000;const result:MidiNoteEvent[]=[];
 while(p+8<=d.byteLength){const id=String.fromCharCode(d.getUint8(p),d.getUint8(p+1),d.getUint8(p+2),d.getUint8(p+3)),len=u32(p+4),end=Math.min(d.byteLength,p+8+len);p+=8;if(id!=='MTrk'){p=end;continue;}let tick=0,status=0;
 while(p<end){let delta=0,b:number;do{b=d.getUint8(p++);delta=(delta<<7)|(b&127);}while((b&128)&&p<end);tick+=delta;if(p>=end)break;let first=d.getUint8(p);if(first&128){status=first;p++;}else if(!status)throw new Error('Invalid MIDI running status.');
 if(status===0xff){const type=d.getUint8(p++);let size=0;do{b=d.getUint8(p++);size=(size<<7)|(b&127);}while((b&128)&&p<end);if(type===0x51&&size===3&&p+2<end)tempo=(d.getUint8(p)<<16)|(d.getUint8(p+1)<<8)|d.getUint8(p+2);p+=size;continue;}
 if(status===0xf0||status===0xf7){let size=0;do{b=d.getUint8(p++);size=(size<<7)|(b&127);}while((b&128)&&p<end);p+=size;continue;}
 const kind=status&0xf0,channel=status&15;if(kind===0xc0||kind===0xd0){p++;continue;}if(p+1>=end)break;const n=d.getUint8(p++),v=d.getUint8(p++);if(kind===0x90&&v>0||kind===0x80||kind===0x90&&v===0){const ms=tick*tempo/Math.max(1,division)/1000;result.push({note:n,velocity:v,time:ms,type:kind===0x90&&v>0?'on':'off',channel});}
 }
 p=end;
 }
 return result.sort((a,b)=>a.time-b.time);
}
