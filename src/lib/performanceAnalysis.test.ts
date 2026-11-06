import { describe, expect, it } from 'vitest';
import { assessNoteSequence, assessPitchSet } from './performanceAnalysis';

describe('MIDI pitch assessment', () => {
  it('awards a perfect score for an exact voicing', () => {
    const result = assessPitchSet([60, 64, 67], [67, 60, 64]);
    expect(result.score).toBe(100);
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual([]);
  });

  it('reports missing and extra notes separately', () => {
    const result = assessPitchSet([60, 64, 67], [60, 65, 67]);
    expect(result.matched).toEqual([60, 67]);
    expect(result.missing).toEqual([64]);
    expect(result.extra).toEqual([65]);
    expect(result.score).toBe(67);
  });

  it('does not let octave doublings inflate pitch-class accuracy', () => {
    const result = assessPitchSet([60, 64, 67], [60, 64, 67, 72]);
    expect(result.pitchClassScore).toBe(100);
    expect(result.score).toBe(86);
    expect(result.extra).toEqual([72]);
  });

  it('returns a safe zero score for an empty attempt', () => {
    const result = assessPitchSet([60, 64, 67], []);
    expect(result.score).toBe(0);
    expect(result.precision).toBe(0);
    expect(result.recall).toBe(0);
    expect(result.f1).toBe(0);
    expect(result.missing).toEqual([60, 64, 67]);
  });

  it('deduplicates repeated MIDI pitches', () => {
    const result = assessPitchSet([60, 64, 67], [60, 60, 64, 67]);
    expect(result.score).toBe(100);
    expect(result.matched).toEqual([60, 64, 67]);
  });
});

describe('MIDI sequence order assessment',()=>{
 it('awards a perfect score for notes played in target order',()=>{
  expect(assessNoteSequence([60,62,64,65],[60,62,64,65])).toBe(100);
 });
 it('penalizes a correct note set played in the wrong order',()=>{
  expect(assessNoteSequence([60,62,64,65],[65,64,62,60])).toBeLessThan(50);
 });
 it('penalizes inserted notes without discarding the correct sequence',()=>{
  expect(assessNoteSequence([60,62,64],[60,61,62,64])).toBe(75);
 });
 it('returns zero for an empty attempt',()=>{
  expect(assessNoteSequence([60,62],[])).toBe(0);
 });
});
