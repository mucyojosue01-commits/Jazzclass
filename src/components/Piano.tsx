import type { CSSProperties } from 'react';
import { pcName, KEYBOARD_LOW, KEYBOARD_HIGH } from '../music';
type Props = { activeNotes?: number[]; leftNotes?: number[]; rightNotes?: number[]; onKey?: (midi:number) => void; compact?: boolean };
const WHITE = [0,2,4,5,7,9,11], BLACK = [1,3,6,8,10];
const handKeyStyle = (hand: 'left' | 'right' | null, black: boolean): CSSProperties => {
  if (hand === 'left') return black
    ? { background: 'linear-gradient(90deg,#174b2b 0%,#68d78a 48%,#174b2b 100%)', border: '1px solid #8ce8a5', borderBottom: '3px solid #276b3c', color: '#f0fff3', boxShadow: '0 0 17px rgba(87,218,125,.55)' }
    : { background: 'linear-gradient(180deg,#e4ffeb 0%,#83d99b 100%)', border: '1px solid #43b96a', borderBottom: '3px solid #27884a', color: '#10391e', boxShadow: '0 0 17px rgba(87,218,125,.55)' };
  if (hand === 'right') return black
    ? { background: 'linear-gradient(90deg,#72500b 0%,#f0c84d 48%,#72500b 100%)', border: '1px solid #f7df83', borderBottom: '3px solid #9e7417', color: '#fff9df', boxShadow: '0 0 17px rgba(245,196,54,.58)' }
    : { background: 'linear-gradient(180deg,#fff6c9 0%,#f2cd55 100%)', border: '1px solid #e0b52e', borderBottom: '3px solid #b88a16', color: '#493507', boxShadow: '0 0 17px rgba(245,196,54,.58)' };
  return {};
};
export default function Piano({ activeNotes = [], leftNotes = [], rightNotes = [], onKey, compact = false }: Props) {
  const whites:number[] = [];
  for (let m=KEYBOARD_LOW; m<=KEYBOARD_HIGH; m++) if (WHITE.includes(m%12)) whites.push(m);
  const blacks = whites.flatMap((m,i) => i < whites.length-1 && BLACK.includes((m+1)%12) ? [{midi:m+1,index:i}] : []);
  return <div className={'dock-piano '+(compact?'compact':'')} style={{minWidth:470}}>
    <div className="dock-whites">{whites.map(m => { const hand = leftNotes.includes(m) ? 'left' : rightNotes.includes(m) ? 'right' : null; return <button key={m} type="button" aria-label={pcName(m)} className={'dock-key white '+(hand==='left'?'active-left':hand==='right'?'active-right':activeNotes.includes(m)?'active-gold':'')} style={handKeyStyle(hand,false)} onPointerDown={() => onKey?.(m)}><span>{pcName(m)}</span></button>; })}</div>
    {blacks.map(({midi,index}) => { const hand = leftNotes.includes(midi) ? 'left' : rightNotes.includes(midi) ? 'right' : null; return <button key={midi} type="button" aria-label={pcName(midi)} className={'dock-key black '+(hand==='left'?'active-left':hand==='right'?'active-right':activeNotes.includes(midi)?'active-gold':'')} style={{left:((index+1)/whites.length*100)+'%',width:(100/whites.length*.62)+'%',...handKeyStyle(hand,true)}} onPointerDown={() => onKey?.(midi)}><span>{pcName(midi)}</span></button>; })}
  </div>;
}
