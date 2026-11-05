import {describe,expect,it} from 'vitest';
import {buildHarmonySteps,HARMONY_PROGRESSIONS,HARMONY_PASSING_PATHS} from './harmonyPractice';

describe('harmony practice engine',()=>{
 it('builds a jazz ii-V-I in any selected key',()=>{
  const steps=buildHarmonySteps('C','jazz-251','progression');
  expect(steps.map(step=>step.symbol)).toEqual(['Dm7','G7','Cmaj7']);
  expect(steps[0].right.map(n=>n%12)).toEqual([2,5,9,0]);
 });
 it('transposes every chord while preserving its quality',()=>{
  const c=buildHarmonySteps('C','jazz-251','progression');
  const f=buildHarmonySteps('F','jazz-251','progression');
  expect(f.map((step,index)=>(step.root-c[index].root+12)%12)).toEqual([5,5,5]);
  expect(f[2].right.map(n=>n%12)).toEqual([5,9,0,4]);
 });
 it('provides passing-chord pathways with a destination chord',()=>{
  const path=buildHarmonySteps('F♯','tritone-resolution','passing');
  expect(path.length).toBeGreaterThanOrEqual(3);
  expect(path[path.length-1]?.symbol).toBe('F♯maj7');
  expect(HARMONY_PASSING_PATHS.length).toBeGreaterThanOrEqual(4);
 });
 it('exposes useful progression families without rhythmic notation',()=>{
  expect(HARMONY_PROGRESSIONS.map(item=>item.name)).toEqual(expect.arrayContaining(['Jazz ii–V–I','Gospel turnaround','Worship I–V–vi–IV']));
  expect(buildHarmonySteps('A','gospel-turnaround','progression').every(step=>step.left.length&&step.right.length)).toBe(true);
 });
});
