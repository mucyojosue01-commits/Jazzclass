import {describe,expect,it} from 'vitest';
import {getMidiLessons,MIDI_LESSONS} from './midiCurriculum';

describe('MIDI lesson curriculum',()=>{
 it('provides a structured curriculum across four difficulty levels',()=>{
  expect(MIDI_LESSONS.length).toBeGreaterThanOrEqual(18);
  expect(new Set(MIDI_LESSONS.map(x=>x.level))).toEqual(new Set(['Foundation','Developing','Advanced','Professional']));
 });
 it('transposes exact chord targets to every key',()=>{
  const fsharp=getMidiLessons(6).find(x=>x.id==='triad-major');
  const c=getMidiLessons(0).find(x=>x.id==='triad-major');
  expect(fsharp?.baseNotes).toEqual([66,70,73]);
  expect(c?.baseNotes).toEqual([60,64,67]);
 });
 it('keeps progression steps individually assessable and transposable',()=>{
  const progression=getMidiLessons(6).find(x=>x.id==='turnaround');
  const transposed=getMidiLessons(0).find(x=>x.id==='turnaround');
  expect(progression?.steps?.map(step=>step.label)).toHaveLength(4);
  expect(progression?.steps?.[0].notes).toEqual([42,66,70,73,77]);
  expect(transposed?.steps?.[0].notes).toEqual([36,60,64,67,71]);
 });
});
