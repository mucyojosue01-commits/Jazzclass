import {describe,expect,it} from 'vitest';
import {buildMidiFile,parseMidiFile,recognizeChord,midiNoteName} from './midiEngine';

describe('JazzClass MIDI engine',()=>{
 it('names MIDI notes with octave',()=>expect(midiNoteName(69)).toBe('A4'));
 it('recognizes a major seventh chord from simultaneous notes',()=>expect(recognizeChord([66,70,73,77])).toBe('F♯ maj7'));
 it('exports and re-imports a standard format-1 MIDI take',async()=>{
  const events=[{note:66,velocity:90,time:0,type:'on' as const,channel:0},{note:66,velocity:0,time:500,type:'off' as const,channel:0},{note:70,velocity:76,time:500,type:'on' as const,channel:0},{note:70,velocity:0,time:1000,type:'off' as const,channel:0}];
  const blob=buildMidiFile(events,120),bytes=await blob.arrayBuffer(),data=new DataView(bytes);
  expect(String.fromCharCode(data.getUint8(0),data.getUint8(1),data.getUint8(2),data.getUint8(3))).toBe('MThd');
  expect(data.getUint16(10)).toBe(2);
  const parsed=parseMidiFile(bytes);
  expect(parsed.map(e=>[e.note,e.type])).toEqual(events.map(e=>[e.note,e.type]));
  expect(parsed[2].time).toBeCloseTo(500,0);
 });
 it('rejects non-MIDI input',()=>expect(()=>parseMidiFile(new ArrayBuffer(4))).toThrow('not a Standard MIDI File'));
});
