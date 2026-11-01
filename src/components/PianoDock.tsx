import Piano from './Piano';
type Props = { title:string; sub:string; activeNotes:number[]; leftNotes?:number[]; rightNotes?:number[]; playing:boolean; onKey:(midi:number)=>void; onStop:()=>void };
export default function PianoDock({title,sub,activeNotes,leftNotes=[],rightNotes=[],playing,onKey,onStop}:Props) {
  return <div className="piano-dock"><div className="dock-inner"><div className="dock-heading"><div className="dock-label"><strong>{title}</strong>{sub&&<><i>·</i><span>{sub}</span></>}</div>{playing?<button onClick={onStop} className="dock-stop">■ Stop</button>:<span className="dock-key-label">F♯</span>}</div><div className="dock-scroll"><Piano activeNotes={activeNotes} leftNotes={leftNotes} rightNotes={rightNotes} onKey={onKey}/></div></div></div>;
}
