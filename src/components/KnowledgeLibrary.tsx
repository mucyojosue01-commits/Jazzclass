import { useEffect, useMemo, useState } from 'react';
import { getCatalogCounts } from '../lib/musicRepository';
import { supabase } from '../lib/supabaseClient';

type LessonRow = {
  id:string; slug:string; title:string; category:string; level:string;
  summary:string; estimated_minutes:number|null;
  courses:{title:string;slug:string}|null;
};

const panel:React.CSSProperties={background:'#fff',border:'1px solid #e9e6df',borderRadius:16,padding:18};
const muted:React.CSSProperties={color:'#817d74',fontSize:12,lineHeight:1.6};

export default function KnowledgeLibrary(){
 const [lessons,setLessons]=useState<LessonRow[]>([]);
 const [counts,setCounts]=useState<{scales:number;chords:number;progressions:number;lessons:number;sources:number}|null>(null);
 const [query,setQuery]=useState('');
 const [level,setLevel]=useState('All');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  async function load(){
   if(!supabase){setError('Supabase is not configured for this deployment.');setLoading(false);return;}
   setLoading(true);setError('');
   const [lessonResult,countResult]=await Promise.all([
    supabase.from('lessons').select('id,slug,title,category,level,summary,estimated_minutes,courses(title,slug)').eq('published',true).order('sort_order'),
    getCatalogCounts()
   ]);
   if(!alive)return;
   if(lessonResult.error)setError(lessonResult.error.message);
   else setLessons((lessonResult.data??[]) as unknown as LessonRow[]);
   setCounts(countResult);
   setLoading(false);
  }
  void load();
  return ()=>{alive=false};
 },[]);
 const visible=useMemo(()=>lessons.filter(l=>(level==='All'||l.level===level)&&(!query.trim()||[l.title,l.category,l.summary,l.courses?.title].join(' ').toLowerCase().includes(query.trim().toLowerCase()))),[lessons,level,query]);
 return <div style={{display:'grid',gap:16}}>
  <section style={{...panel,background:'#f8f7f3'}}>
   <div style={{fontSize:10,letterSpacing:2,color:'#9b865f',fontWeight:700}}>JAZZCLASS KNOWLEDGE DATABASE</div>
   <h2 style={{fontFamily:'Instrument Serif,Georgia,serif',fontSize:30,fontWeight:400,margin:'8px 0'}}>A structured music library.</h2>
   <p style={muted}>Lessons and theory records are now loaded from your dedicated JazzClass Supabase database, not only from local lesson arrays.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(105px,1fr))',gap:8,marginTop:16}}>
    {([['Scales',counts?.scales],['Chord types',counts?.chords],['Progressions',counts?.progressions],['Lessons',counts?.lessons],['Sources',counts?.sources]] as const).map(([label,value])=><div key={label} style={{background:'#fff',border:'1px solid #eeeae2',borderRadius:10,padding:12}}><div style={{fontSize:22,fontWeight:600}}>{value??'—'}</div><div style={{...muted,fontSize:10}}>{label}</div></div>)}
   </div>
  </section>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search lessons, subjects and courses…" style={{flex:'1 1 220px',minWidth:0,padding:'12px 14px',border:'1px solid #e3dfd6',borderRadius:10,font:'inherit',background:'#fff'}}/>
   <select value={level} onChange={e=>setLevel(e.target.value)} style={{padding:'12px 14px',border:'1px solid #e3dfd6',borderRadius:10,background:'#fff'}}><option>All</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
  </div>
  {loading?<div style={panel}>Loading the JazzClass catalogue…</div>:error?<div style={{...panel,borderColor:'#d9a4a4',color:'#8b3030'}}>Database connection error: {error}</div>:<div style={{display:'grid',gap:9}}>
   <div style={muted}>{visible.length} lessons available from Supabase</div>
   {visible.map(lesson=><article key={lesson.id} style={{...panel,display:'grid',gap:5}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><span style={{fontSize:9,letterSpacing:1.4,color:'#a18a5c',fontWeight:700}}>{lesson.category.toUpperCase()}</span><span style={{fontSize:10,color:'#817d74'}}>{lesson.level} · {lesson.estimated_minutes??'—'} min</span></div>
    <h3 style={{fontSize:17,margin:'2px 0'}}>{lesson.title}</h3>
    <p style={{...muted,margin:0}}>{lesson.summary}</p>
    <div style={{fontSize:10,color:'#817d74',marginTop:4}}>{lesson.courses?.title??'JazzClass lesson'}</div>
   </article>)}
   {!visible.length&&<div style={panel}>No lessons match this search.</div>}
  </div>}
 </div>;
}
