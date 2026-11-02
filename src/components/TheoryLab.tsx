import {useEffect,useMemo,useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import {KEY_OPTIONS,CHORD_TYPES,SCALE_TYPES,PROGRESSION_TEMPLATES,makeScale,makeChord,makeArpeggio,makeVoicing,makeSlashChord,makeScaleHarmony,makeLick,LICK_TEMPLATES,invertChord,realizeProgression,midiName} from '../musicTheory';
type Course={id:string;slug:string;title:string;description:string;level:string;style:string|null;sort_order:number};
type Lesson={id:string;slug:string;title:string;category:string;level:string;objectives:string[];summary:string;estimated_minutes:number|null;course_id:string;sort_order:number};
type Section={id:string;section_index:number;heading:string;body:string;example_data:Record<string,unknown>};
type Exercise={id:string;title:string;exercise_type:string;prompt:string;answer_data:Record<string,unknown>;difficulty:number};
type Progress={status:'not_started'|'in_progress'|'completed';progress_percent:number;updated_at:string};
type Step={notes:number[];left:number[];right:number[];label:string;beats?:number};
type Props={onPlay:(notes:number[],left:number[],right:number[],title:string,sequence?:Step[])=>void};
const STORE='jazzclass-theory-progress-v1';
const label=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
type LessonDemo={notes:number[];left:number[];right:number[];steps?:Step[]};
function demo(lesson:Lesson,root:number):LessonDemo{
 const scale=(id:string)=>SCALE_TYPES.find(x=>x.id===id)!;
 const chord=(id:string)=>CHORD_TYPES.find(x=>x.id===id)!;
 const scaleLessons:Record<string,string>={
  'major-scale-formula':'major','keyboard-geography':'major','minor-scale-families':'natural_minor',
  'modes-and-modal-colour':'dorian','pentatonic-and-blues':'blues','bebop-and-altered-scales':'bebop_dominant',
  'altered-dominants':'altered','blues-shuffle-phrasing':'blues'
 };
 if(scaleLessons[lesson.slug]){
  const ns=makeScale(root,scale(scaleLessons[lesson.slug]),4);
  return{notes:ns,left:[],right:ns,steps:ns.map(n=>({notes:[n],left:[],right:[n],label:midiName(n),beats:.5}))};
 }
 if(['jazz-two-five-one','gospel-turnarounds','worship-and-praise','blues-dominant-harmony','blues-turnarounds'].includes(lesson.slug)){
  const id=lesson.slug==='jazz-two-five-one'?'jazz251':lesson.slug==='gospel-turnarounds'?'gospel':lesson.slug==='worship-and-praise'?'worship':'blues';
  const t=PROGRESSION_TEMPLATES.find(x=>x.id===id)!;
  const ps=realizeProgression(root,t,2,0);
  return{notes:ps.flatMap(p=>[...p.left,...p.right]),left:ps.flatMap(p=>p.left),right:ps.flatMap(p=>p.right),steps:ps.map(p=>({notes:[...p.left,...p.right],left:p.left,right:p.right,label:p.name,beats:2}))};
 }
 if(['pop-broken-chord-patterns','chord-arpeggios'].includes(lesson.slug)){
  const c=lesson.slug==='chord-arpeggios'?chord('major7'):chord('major');
  const ns=makeArpeggio(root,c,3,'up_down');
  return{notes:ns,left:[],right:ns,steps:ns.map(n=>({notes:[n],left:[],right:[n],label:midiName(n),beats:.5}))};
 }
 const quality=['funk-chord-stabs'].includes(lesson.slug)?'dominant9':
  ['funk-vamps-and-arrangement'].includes(lesson.slug)?'dominant13':
  ['accompaniment-role-and-space','left-hand-bass-and-right-hand-chords','supporting-singers-and-transposition'].includes(lesson.slug)?'major9':
  ['seventh-chord-families','extended-chords','inversions-versus-voicings'].includes(lesson.slug)?'major7':'major';
 const rh=makeChord(root,chord(quality),4);
 const voiced=['inversions-versus-voicings','pop-chord-inversions'].includes(lesson.slug)?invertChord(rh,1):rh;
 const bass=36+root;const left=[bass,bass+7];
 return{notes:[...left,...voiced],left,right:voiced};
}
export default function TheoryLab({onPlay}:Props){
 const[workspace,setWorkspace]=useState<'explore'|'courses'>('explore');
 const[exploreTab,setExploreTab]=useState<'Scales'|'Chords'|'Inversions'|'Voicings'|'Progressions'|'Slash Chords'|'Harmony'|'Arpeggios'|'Runs & Licks'>('Chords');
 const[exploreKey,setExploreKey]=useState(6),[scaleId,setScaleId]=useState('major'),[chordId,setChordId]=useState('major7'),[exploreInversion,setExploreInversion]=useState(0),[progressionId,setProgressionId]=useState('jazz251'),[slashBass,setSlashBass]=useState(7),[harmonyStep,setHarmonyStep]=useState(2),[arpeggioDirection,setArpeggioDirection]=useState<'up'|'down'|'up_down'>('up_down');
 const[courses,setCourses]=useState<Course[]>([]),[lessons,setLessons]=useState<Lesson[]>([]);
 const[courseId,setCourseId]=useState<string|null>(null),[lesson,setLesson]=useState<Lesson|null>(null);
 const[sections,setSections]=useState<Section[]>([]),[exercises,setExercises]=useState<Exercise[]>([]);
 const[progress,setProgress]=useState<Record<string,Progress>>({}),[root,setRoot]=useState(0),[query,setQuery]=useState('');
 const[loading,setLoading]=useState(true),[detailLoading,setDetailLoading]=useState(false),[error,setError]=useState(''),[userId,setUserId]=useState<string|null>(null),[saved,setSaved]=useState('Progress saved on this device');
 useEffect(()=>{let alive=true;const load=async()=>{if(!supabase){setError('Supabase is not configured.');setLoading(false);return;}
 const [cr,lr,sr]=await Promise.all([supabase.from('courses').select('id,slug,title,description,level,style,sort_order').eq('published',true).order('sort_order'),supabase.from('lessons').select('id,slug,title,category,level,objectives,summary,estimated_minutes,course_id,sort_order').eq('published',true).order('sort_order'),supabase.auth.getSession()]);
 if(!alive)return;if(cr.error||lr.error){setError(cr.error?.message??lr.error?.message??'Curriculum unavailable.');setLoading(false);return;}
 const cs=(cr.data??[]) as Course[],ls=(lr.data??[]) as Lesson[];setCourses(cs);setLessons(ls);setCourseId(null);
 const uid=sr.data.session?.user.id??null;setUserId(uid);let local:Record<string,Progress>={};try{local=JSON.parse(localStorage.getItem(STORE)??'{}') as Record<string,Progress>}catch{}
 if(uid){const cloud=await supabase.from('user_lesson_progress').select('lesson_id,status,progress_percent,updated_at').eq('user_id',uid);if(!alive)return;if(!cloud.error){for(const row of cloud.data??[]){const l=ls.find(x=>x.id===row.lesson_id);if(l)local[l.slug]={status:row.status,progress_percent:row.progress_percent,updated_at:row.updated_at};}setSaved('Cloud progress connected');}else setSaved('Cloud unavailable · local progress active');}
 setProgress(local);setLoading(false);};void load();const sub=supabase?.auth.onAuthStateChange((_e,s)=>setUserId(s?.user.id??null)).data.subscription;return()=>{alive=false;sub?.unsubscribe()};},[]);
 const courseLessons=useMemo(()=>lessons.filter(l=>l.course_id===courseId),[lessons,courseId]),filtered=useMemo(()=>courseLessons.filter(l=>!query.trim()||[l.title,l.summary,l.category].join(' ').toLowerCase().includes(query.toLowerCase())),[courseLessons,query]);
 const course=courses.find(c=>c.id===courseId),completed=lessons.filter(l=>progress[l.slug]?.status==='completed').length,inProgress=lessons.filter(l=>progress[l.slug]?.status==='in_progress').length;
 const openLesson=async(l:Lesson)=>{setLesson(l);setDetailLoading(true);setSections([]);setExercises([]);const[s,e]=await Promise.all([supabase!.from('lesson_sections').select('id,section_index,heading,body,example_data').eq('lesson_id',l.id).order('section_index'),supabase!.from('exercises').select('id,title,exercise_type,prompt,answer_data,difficulty').eq('lesson_id',l.id).order('difficulty')]);setSections((s.data??[]) as Section[]);setExercises((e.data??[]) as Exercise[]);setDetailLoading(false);};
 const mark=async(status:Progress['status'])=>{if(!lesson)return;const p:Progress={status,progress_percent:status==='completed'?100:status==='in_progress'?35:0,updated_at:new Date().toISOString()};const next={...progress,[lesson.slug]:p};setProgress(next);localStorage.setItem(STORE,JSON.stringify(next));setSaved(userId?'Saving…':'Progress saved on this device');if(userId){const{error:e}=await supabase!.from('user_lesson_progress').upsert({user_id:userId,lesson_id:lesson.id,status,progress_percent:p.progress_percent,updated_at:p.updated_at},{onConflict:'user_id,lesson_id'});setSaved(e?'Cloud save failed · local copy saved':'Cloud progress synced');}};
 const playExample=()=>{if(!lesson)return;const d=demo(lesson,root);onPlay(d.notes,d.left,d.right,lesson.title,d.steps);};
 if(loading)return <section className="theory-academy"><div className="academy-loading">Loading the JazzClass curriculum…</div></section>;
 if(error)return <section className="theory-academy"><div className="academy-error">{error}</div></section>;
 const selectedChord=CHORD_TYPES.find(x=>x.id===chordId)??CHORD_TYPES[0];
 const selectedScale=SCALE_TYPES.find(x=>x.id===scaleId)??SCALE_TYPES[0];
 const exploreNotes=exploreTab==='Scales'?makeScale(exploreKey,selectedScale,4):
  exploreTab==='Chords'?makeVoicing(exploreKey,selectedChord,0,3):
  exploreTab==='Inversions'||exploreTab==='Voicings'?makeVoicing(exploreKey,selectedChord,exploreInversion,3):
  exploreTab==='Progressions'?realizeProgression(exploreKey,PROGRESSION_TEMPLATES.find(x=>x.id===progressionId)??PROGRESSION_TEMPLATES[0],2,exploreInversion).flatMap(x=>[...x.left,...x.right]):
  exploreTab==='Slash Chords'?[...makeSlashChord(exploreKey,selectedChord,slashBass,2).bass,...makeSlashChord(exploreKey,selectedChord,slashBass,2).upper]:
  exploreTab==='Harmony'?makeScaleHarmony(exploreKey,selectedScale,harmonyStep,3).flatMap(x=>x.notes):
  exploreTab==='Arpeggios'?makeArpeggio(exploreKey,selectedChord,3,arpeggioDirection):
  makeLick(exploreKey,LICK_TEMPLATES[0].intervals,4);
 const playExplore=()=>{
  const title=exploreTab+' · '+KEY_OPTIONS[exploreKey].name;
  let sequence:Step[]|undefined;
  if(exploreTab==='Scales'){
   sequence=exploreNotes.map(n=>({notes:[n],left:[],right:[n],label:midiName(n),beats:.5}));
  }else if(exploreTab==='Harmony'){
   sequence=makeScaleHarmony(exploreKey,selectedScale,harmonyStep,3).map(x=>({notes:x.notes,left:[],right:x.notes,label:x.label,beats:1}));
  }else if(exploreTab==='Arpeggios'||exploreTab==='Runs & Licks'){
   sequence=exploreNotes.map(n=>({notes:[n],left:[],right:[n],label:midiName(n),beats:.5}));
  }else if(exploreTab==='Progressions'){
   const ps=realizeProgression(exploreKey,PROGRESSION_TEMPLATES.find(x=>x.id===progressionId)??PROGRESSION_TEMPLATES[0],2,exploreInversion);
   sequence=ps.map(x=>({notes:[...x.left,...x.right],left:x.left,right:x.right,label:x.name,beats:2}));
  }
  if(sequence?.length){
   onPlay(sequence.flatMap(x=>x.notes),sequence.flatMap(x=>x.left),sequence.flatMap(x=>x.right),title,sequence);
   return;
  }
  if(exploreTab==='Slash Chords'){
   const slash=makeSlashChord(exploreKey,selectedChord,slashBass,2);
   onPlay([...slash.bass,...slash.upper],slash.bass,slash.upper,title);
   return;
  }
  onPlay(exploreNotes,[],exploreNotes,title);
 };
 if(workspace==='explore')return <section className="theory-academy">
 <nav className="theory-workspace-tabs" aria-label="Theory Lab workspace"><button className="active" onClick={()=>setWorkspace('explore')}>Explore</button><button onClick={()=>setWorkspace('courses')}>Courses & lessons</button></nav>
 <header className="academy-hero"><div><span className="detail-kicker">JAZZCLASS MUSIC ENGINE · ALL 12 KEYS</span><h2>Theory Lab</h2><p>Explore musical ideas freely. Choose a category, change the key and musical shape, then play the result on the single practice keyboard below.</p></div></header>
 <nav className="theory-explorer-tabs" aria-label="Theory categories">{(['Scales','Chords','Inversions','Voicings','Progressions','Slash Chords','Harmony','Arpeggios','Runs & Licks'] as const).map(t=><button key={t} className={exploreTab===t?'selected':''} onClick={()=>setExploreTab(t)}>{t}</button>)}</nav>
 <div className="theory-explorer-panel"><div className="theory-explorer-controls">
 <label>KEY<select value={exploreKey} onChange={e=>setExploreKey(+e.target.value)}>{KEY_OPTIONS.map(k=><option key={k.pitchClass} value={k.pitchClass}>{k.name}</option>)}</select></label>
 {['Scales','Harmony'].includes(exploreTab)&&<label>SCALE<select value={scaleId} onChange={e=>setScaleId(e.target.value)}>{SCALE_TYPES.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}
 {['Chords','Inversions','Voicings','Slash Chords','Arpeggios'].includes(exploreTab)&&<label>CHORD QUALITY<select value={chordId} onChange={e=>setChordId(e.target.value)}>{Array.from(new Set(CHORD_TYPES.map(x=>x.family))).map(f=><optgroup key={f} label={f}>{CHORD_TYPES.filter(x=>x.family===f).map(x=><option key={x.id} value={x.id}>{x.name} {x.symbol?'('+x.symbol+')':''}</option>)}</optgroup>)}</select></label>}
 {['Inversions','Voicings','Progressions'].includes(exploreTab)&&<label>INVERSION<select value={exploreInversion} onChange={e=>setExploreInversion(+e.target.value)}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n===0?'Root position':n+' inversion'}</option>)}</select></label>}
 {exploreTab==='Progressions'&&<label>PROGRESSION<select value={progressionId} onChange={e=>setProgressionId(e.target.value)}>{PROGRESSION_TEMPLATES.map(x=><option key={x.id} value={x.id}>{x.name} · {x.style}</option>)}</select></label>}
 {exploreTab==='Slash Chords'&&<label>BASS NOTE<select value={slashBass} onChange={e=>setSlashBass(+e.target.value)}>{Array.from({length:12},(_,i)=><option key={i} value={i}>{KEY_OPTIONS[(exploreKey+i)%12].name}</option>)}</select></label>}
 {exploreTab==='Harmony'&&<label>HARMONY<select value={harmonyStep} onChange={e=>setHarmonyStep(+e.target.value)}><option value={2}>Thirds</option><option value={3}>Fourths</option><option value={4}>Fifths</option><option value={5}>Sixths</option></select></label>}
 {exploreTab==='Arpeggios'&&<label>DIRECTION<select value={arpeggioDirection} onChange={e=>setArpeggioDirection(e.target.value as typeof arpeggioDirection)}><option value="up">Ascending</option><option value="down">Descending</option><option value="up_down">Up & down</option></select></label>}
 </div><div className="theory-explorer-result"><div><span className="academy-eyebrow">{exploreTab.toUpperCase()} · {KEY_OPTIONS[exploreKey].name}</span><h3>{exploreTab==='Progressions'?(PROGRESSION_TEMPLATES.find(x=>x.id===progressionId)?.name??'Progression'):exploreTab==='Scales'?selectedScale.name:exploreTab==='Harmony'?selectedScale.name+' harmony':exploreTab==='Slash Chords'?makeSlashChord(exploreKey,selectedChord,slashBass).symbol:KEY_OPTIONS[exploreKey].name+' '+selectedChord.name}</h3><p>{exploreTab==='Scales'?selectedScale.description:exploreTab==='Chords'||exploreTab==='Inversions'||exploreTab==='Voicings'?selectedChord.name+' · intervals '+selectedChord.intervals.join(' – '):exploreTab==='Progressions'?(PROGRESSION_TEMPLATES.find(x=>x.id===progressionId)?.description??''):exploreTab==='Harmony'?'Diatonic note relationships across the selected scale.':'Explore and hear the selected musical material.'}</p></div><div className="theory-note-chips">{exploreNotes.map((n,i)=><span key={i}>{midiName(n)}</span>)}</div><button className="theory-play-button" onClick={playExplore}>▶ Play on practice piano</button></div></div>
 </section>;
 if(lesson){const p=progress[lesson.slug];const lessonDemo=demo(lesson,root);return <section className="theory-academy">
 <div className="academy-topline"><button className="academy-back" onClick={()=>setLesson(null)}>← All courses</button><span>{course?.title} / {lesson.category}</span></div>
 <header className="academy-detail-hero"><div><span className="detail-kicker">LESSON · {label(lesson.level)} · {lesson.estimated_minutes??'—'} MIN</span><h2>{lesson.title}</h2><p>{lesson.summary}</p></div><div className="academy-completion"><strong>{p?.progress_percent??0}%</strong><span>{p?.status==='completed'?'Completed':p?.status==='in_progress'?'In progress':'Not started'}</span></div></header>
 <div className="academy-detail-grid"><article className="academy-lesson-content">
 <section className="academy-block"><span className="academy-eyebrow">LEARNING OBJECTIVES</span><h3>By the end of this lesson</h3><ul className="academy-objectives">{lesson.objectives.map(x=><li key={x}>{x}</li>)}</ul></section>
 {detailLoading?<div className="academy-loading">Loading lesson material…</div>:sections.map(s=><section className="academy-block" key={s.id}><span className="academy-eyebrow">CONCEPT {s.section_index}</span><h3>{s.heading}</h3><p>{s.body}</p>{typeof s.example_data.practice==='string'&&<div className="academy-practice-note"><b>Practice direction</b><span>{s.example_data.practice}</span></div>}</section>)}
 <section className="academy-block academy-example"><div><span className="academy-eyebrow">LESSON EXAMPLE</span><h3>Explore the sound in {KEY_OPTIONS[root].name}</h3><p>Play the lesson example using the single shared practice keyboard at the bottom of the studio. Change key to transpose the demonstration.</p></div><div className="academy-example-controls"><select value={root} onChange={e=>setRoot(+e.target.value)} aria-label="Transpose lesson example">{KEY_OPTIONS.map(k=><option key={k.pitchClass} value={k.pitchClass}>{k.name}</option>)}</select><button onClick={playExample}>▶ Play lesson example</button></div><div className="academy-note-readout"><span>EXAMPLE NOTES</span><div>{lessonDemo.notes.map((n,i)=><b key={n+"-"+i}>{midiName(n)}</b>)}</div></div></section>
 <section className="academy-block"><span className="academy-eyebrow">PRACTICE & APPLICATION</span><h3>Put the concept into your hands</h3>{exercises.length?exercises.map(ex=><div className="academy-exercise" key={ex.id}><b>{ex.title}</b><p>{ex.prompt}</p><ul>{(Array.isArray(ex.answer_data.success_criteria)?ex.answer_data.success_criteria as string[]:[]).map(x=><li key={x}>{x}</li>)}</ul><small>Difficulty {ex.difficulty}/5 · {ex.exercise_type.replace(/_/g,' ')}</small></div>):<div className="academy-exercise"><b>Practice assignment</b><p>Play slowly, listen for accuracy and evenness, then transpose the idea through all twelve keys.</p><ul><li>Play without stopping.</li><li>Listen for clear pitch and rhythm.</li><li>Repeat in a second key.</li></ul></div>}</section>
 <div className="academy-mark-progress"><div><span className="academy-eyebrow">YOUR LEARNING RECORD</span><h3>Lesson progress</h3><p>{saved}</p></div><div className="academy-progress-actions"><button className={p?.status==='in_progress'?'active':''} onClick={()=>void mark('in_progress')}>Mark in progress</button><button className={p?.status==='completed'?'active':''} onClick={()=>void mark('completed')}>✓ Mark completed</button></div></div>
 </article><aside className="academy-outline"><span className="academy-eyebrow">COURSE CONTENT</span><h3>{course?.title}</h3>{courseLessons.map((l,i)=><button key={l.id} className={l.id===lesson.id?'current':''} onClick={()=>void openLesson(l)}><span>{String(i+1).padStart(2,'0')}</span><div><b>{l.title}</b><small>{progress[l.slug]?.status??'Not started'} · {l.estimated_minutes??'—'} min</small></div></button>)}</aside></div></section>;}
 return <section className="theory-academy"><nav className="theory-workspace-tabs" aria-label="Theory Lab workspace"><button onClick={()=>setWorkspace('explore')}>Explore</button><button className="active" onClick={()=>setWorkspace('courses')}>Courses & lessons</button></nav><header className="academy-hero"><div><span className="detail-kicker">JAZZCLASS KNOWLEDGE · LEARN BY SEQUENCE</span><h2>Theory Lab</h2><p>A structured path from keyboard foundations to advanced harmony. Open each lesson for its concepts, examples, practice tasks and progress record.</p></div><div className="academy-summary"><div><strong>{completed}/{lessons.length}</strong><span>LESSONS COMPLETED</span></div><div><strong>{inProgress}</strong><span>IN PROGRESS</span></div></div></header>
 <div className="academy-overview"><div><span className="academy-eyebrow">YOUR CURRICULUM</span><h3>Courses & lessons</h3><p>Choose a course, then open a lesson to study it in its own focused page.</p></div><div className="academy-total">{lessons.length} lessons · {courses.length} courses</div></div>
 {courseId===null?<div className="academy-course-grid">{courses.map(c=>{const ls=lessons.filter(l=>l.course_id===c.id);const done=ls.filter(l=>progress[l.slug]?.status==='completed').length;return <button className="academy-course-card" key={c.id} onClick={()=>{setCourseId(c.id);setQuery('')}}><span className="academy-eyebrow">{label(c.level)}{c.style?' · '+c.style:''}</span><h3>{c.title}</h3><p>{c.description}</p><div className="academy-course-card-foot"><span>{ls.length} lessons</span><span>{done}/{ls.length} completed</span><b>Explore course →</b></div><div className="academy-course-card-preview">{ls.slice(0,3).map((l,i)=><span key={l.id}>{String(i+1).padStart(2,'0')} · {l.title}</span>)}</div></button>})}</div>:<><div className="academy-course-switch"><button onClick={()=>setCourseId(null)}>← All courses</button><span>{courses.length} courses in the academy</span></div> {course&&<div className="academy-course-heading"><div><span className="academy-eyebrow">{label(course.level)} COURSE {course.style?'· '+course.style:''}</span><h3>{course.title}</h3><p>{course.description}</p></div><div className="academy-course-progress"><strong>{courseLessons.filter(l=>progress[l.slug]?.status==='completed').length} / {courseLessons.length}</strong><span>completed</span></div></div>}
 <div className="academy-list-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search lessons in this course…"/><span>{filtered.length} lessons</span></div>
 <div className="academy-lesson-list">{filtered.map((l,i)=><button className="academy-lesson-row" key={l.id} onClick={()=>void openLesson(l)}><span className="academy-lesson-number">{String(i+1).padStart(2,'0')}</span><div className="academy-lesson-copy"><b>{l.title}</b><p>{l.summary}</p><small>{label(l.level)} · {l.estimated_minutes??'—'} min</small></div><span className={'academy-status '+(progress[l.slug]?.status??'not_started')}>{progress[l.slug]?.status??'Not started'}</span><span className="academy-chevron">→</span></button>)}{!filtered.length&&<div className="academy-loading">No lessons match this search.</div>}</div><p className="academy-save-note">{saved}. Sign in to sync lesson progress across devices.</p></>}</section>;
}