type Tab = {id:string;label:string};
export default function TabBar({tabs,active,onChange}:{tabs:readonly Tab[];active:string;onChange:(id:string)=>void}) {
  return <nav className="studio-tabs" aria-label="Piano lessons">{tabs.map(t=><button key={t.id} className={active===t.id?'studio-tab active':'studio-tab'} onClick={()=>onChange(t.id)}>{t.label}</button>)}</nav>;
}
