import {describe,expect,it} from 'vitest';
import {createMidiProgress,normalizeMidiProgress,recordMidiAttempt,getMidiProgressSummary,loadMidiProgress,saveMidiProgress,type MidiStorage} from './midiProgress';
const memoryStorage=():MidiStorage=>{let value:string|null=null;return{getItem:()=>value,setItem:(_key,next)=>{value=next;}};};

describe('MIDI lesson progress',()=>{
 it('normalizes malformed and legacy records safely',()=>{
  const value=normalizeMidiProgress({version:0,lessons:{bad:{bestScore:140,attempts:-2}}});
  expect(value.version).toBe(1);
  expect(value.lessons.bad.bestScore).toBe(100);
  expect(value.lessons.bad.attempts).toBe(0);
 });
 it('preserves the best score and accumulates real practice time',()=>{
  const first=recordMidiAttempt(createMidiProgress(),'triad',72,[60,64],[60,64,67],35);
  const second=recordMidiAttempt(first,'triad',91,[60,64,67],[60,64,67],25);
  const third=recordMidiAttempt(second,'triad',81,[60,64],[60,64,67],10);
  expect(third.lessons.triad.bestScore).toBe(91);
  expect(third.lessons.triad.attempts).toBe(3);
  expect(third.totalPracticeSeconds).toBe(70);
 });
 it('summarizes only attempted lessons and marks mastered lessons',()=>{
  let value=createMidiProgress();
  value=recordMidiAttempt(value,'a',90,[60,64,67],[60,64,67],30);
  value=recordMidiAttempt(value,'b',50,[60],[60,64,67],20);
  const summary=getMidiProgressSummary(value,4);
  expect(summary.totalLessons).toBe(4);
  expect(summary.attemptedLessons).toBe(2);
  expect(summary.masteredLessons).toBe(1);
  expect(summary.averageBestScore).toBe(70);
  expect(summary.totalAttempts).toBe(2);
 });
 it('ranks recurring weak pitch classes by actual frequency',()=>{
  let value=createMidiProgress();
  value=recordMidiAttempt(value,'scale',70,[60,67,71],[60,64,67,71],20);
  value=recordMidiAttempt(value,'scale',70,[60,67,71],[60,64,67,71],20);
  value=recordMidiAttempt(value,'scale',80,[60,64,67,71],[60,64,67,71,74],20);
  expect(value.lessons.scale.weakPitchClassCounts[4]).toBe(2);
  expect(value.lessons.scale.weakPitchClassCounts[2]).toBe(1);
  expect(value.lessons.scale.weakPitchClasses[0]).toBe(4);
 });
 it('requires every progression step to reach mastery before completing the lesson',()=>{
  let value=createMidiProgress();
  value=recordMidiAttempt(value,'turnaround',91,[60,64,67],[60,64,67],25,0,2);
  expect(value.lessons.turnaround.mastered).toBe(false);
  expect(value.lessons.turnaround.bestScoreByStep[0]).toBe(91);
  value=recordMidiAttempt(value,'turnaround',84,[60,64,67],[60,64,67],25,1,2);
  expect(value.lessons.turnaround.mastered).toBe(false);
  value=recordMidiAttempt(value,'turnaround',88,[60,64,67],[60,64,67],25,1,2);
  expect(value.lessons.turnaround.mastered).toBe(true);
  expect(value.lessons.turnaround.attemptsByStep[1]).toBe(2);
 });
 it('loads corrupted storage as a fresh progress record',()=>{
  const storage=memoryStorage();storage.setItem('jazzclass.midi-progress.v1','{broken');
  expect(loadMidiProgress(storage).totalPracticeSeconds).toBe(0);
 });
 it('round-trips progress through local storage',()=>{
  const storage=memoryStorage();
  const value=recordMidiAttempt(createMidiProgress(),'a',88,[60,64,67],[60,64,67],40);
  saveMidiProgress(value,storage);
  expect(loadMidiProgress(storage).lessons.a.bestScore).toBe(88);
 });
});
