import { note, midi, type Lesson } from '../music';
type Props = {item:Lesson;active:boolean;playing:boolean;activeNotes:number[];onPlay:()=>void};
export default function PlayCard({item,active,playing,activeNotes,onPlay}:Props) {
 const shown = item.rh.length ? item.rh : item.lh;
 return <button type="button" onClick={onPlay} className={'play-card '+(active?'chosen':'')}>
  <div className="play-card-top"><div><span className="card-category">{item.category}</span><h3>{item.title}</h3>{item.sub&&<small>{item.sub}</small>}</div><span className={'card-play '+(playing?'is-playing':'')}>{playing?'Ⅱ':'▶'}</span></div>
  <p>{item.feel}</p><div className="card-notes">{shown.slice(0,8).map((n,i)=><span key={i} className={activeNotes.includes(midi(n))?'note-on':''}>{n}</span>)}</div>
 </button>;
}
