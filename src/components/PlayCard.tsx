import { note, midi, type Lesson } from '../music';
type Props = {item:Lesson;active:boolean;playing:boolean;activeNotes:number[];onPlay:()=>void;favorite?:boolean;onToggleFavorite?:()=>void};
export default function PlayCard({item,active,playing,activeNotes,onPlay,favorite=false,onToggleFavorite}:Props) {
 const shown = item.rh.length ? item.rh : item.lh;
 return <article className={'play-card '+(active?'chosen':'')}>
  <button type="button" onClick={onPlay} className="play-card-main">
   <div className="play-card-top"><div><span className="card-category">{item.category}</span><h3>{item.title}</h3>{item.sub&&<small>{item.sub}</small>}</div><span className={'card-play '+(playing?'is-playing':'')}>{playing?'Ⅱ':'▶'}</span></div>
   <p>{item.feel}</p><div className="card-notes">{shown.slice(0,8).map((n,i)=><span key={i} className={activeNotes.includes(midi(n))?'note-on':''}>{n}</span>)}</div>
  </button>
  {onToggleFavorite&&<button type="button" className={'favorite-toggle '+(favorite?'is-favorite':'')} onClick={onToggleFavorite} aria-label={favorite?'Remove from favorites':'Add to favorites'} title={favorite?'Remove from favorites':'Add to favorites'}>{favorite?'★':'☆'} <span>{favorite?'Saved':'Save'}</span></button>}
 </article>;
}
