import { pcName, KEYBOARD_LOW, KEYBOARD_HIGH } from '../music';
type Props = { activeNotes?: number[]; leftNotes?: number[]; rightNotes?: number[]; onKey?: (midi:number) => void; compact?: boolean };
const WHITE = [0,2,4,5,7,9,11], BLACK = [1,3,6,8,10];
export default function Piano({ activeNotes = [], leftNotes = [], rightNotes = [], onKey, compact = false }: Props) {
  const whites:number[] = [];
  for (let m=KEYBOARD_LOW; m<=KEYBOARD_HIGH; m++) if (WHITE.includes(m%12)) whites.push(m);
  const blacks = whites.flatMap((m,i) => i < whites.length-1 && BLACK.includes((m+1)%12) ? [{midi:m+1,index:i}] : []);
  return <div className={'dock-piano '+(compact?'compact':'')} style={{minWidth:470}}>
    <div className="dock-whites">{whites.map(m => <button key={m} type="button" aria-label={pcName(m)} className={'dock-key white '+(leftNotes.includes(m)?'active-left':rightNotes.includes(m)?'active-right':activeNotes.includes(m)?'active-gold':'')} onPointerDown={() => onKey?.(m)}><span>{pcName(m)}</span></button>)}</div>
    {blacks.map(({midi,index}) => <button key={midi} type="button" aria-label={pcName(midi)} className={'dock-key black '+(leftNotes.includes(midi)?'active-left':rightNotes.includes(midi)?'active-right':activeNotes.includes(midi)?'active-gold':'')} style={{left:((index+1)/whites.length*100)+'%',width:(100/whites.length*.62)+'%'}} onPointerDown={() => onKey?.(midi)}><span>{pcName(midi)}</span></button>)}
  </div>;
}
