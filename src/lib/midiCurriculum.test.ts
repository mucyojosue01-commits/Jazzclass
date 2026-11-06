import {describe,expect,it} from 'vitest';
import {filterMidiLessons,getMidiLessons,MIDI_LESSONS} from './midiCurriculum';

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
 it('filters by difficulty, category and lesson search without leaking higher levels',()=>{
  const lessons=getMidiLessons(6);
  const foundation=filterMidiLessons(lessons,'Foundation','All');
  expect(foundation.length).toBeGreaterThan(0);
  expect(foundation.every(item=>item.level==='Foundation')).toBe(true);
  const advancedOnly=filterMidiLessons(lessons,'Advanced','All');
  expect(advancedOnly.every(item=>item.level==='Advanced')).toBe(true);
  expect(filterMidiLessons(lessons,'All','All')).toHaveLength(MIDI_LESSONS.length);
  const advancedJazz=filterMidiLessons(lessons,'Advanced','Jazz voicings','rootless');
  expect(advancedJazz.length).toBe(2);
  expect(advancedJazz.every(item=>item.level!=='Professional'&&item.category==='Jazz voicings')).toBe(true);
 });
 it('keeps progression steps individually assessable and transposable',()=>{
  const progression=getMidiLessons(6).find(x=>x.id==='turnaround');
  const transposed=getMidiLessons(0).find(x=>x.id==='turnaround');
  expect(progression?.steps?.map(step=>step.label)).toHaveLength(4);
  expect(progression?.steps?.[0].notes).toEqual([42,66,70,73,77]);
  expect(transposed?.steps?.[0].notes).toEqual([36,60,64,67,71]);
 });
});
