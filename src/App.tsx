import { useEffect, useMemo, useState } from 'react';
import { midi, note, scales, chordScales, chords, progressions, slashChords, arpeggios, harmonies, runs, tips, keyNotes, type Lesson } from './music';
import { playNote, unlockAudio, playMetronomeTick, closeAudio } from './lib/pianoAudio';
import PianoDock from './components/PianoDock';
import TabBar from './components/TabBar';
import PlayCard from './components/PlayCard';
import SectionIntro from './components/SectionIntro';
import usePlayback from './hooks/usePlayback';
import TheoryLab from './components/TheoryLab';
import KnowledgeLibrary from './components/KnowledgeLibrary';

const TABS = [
  { id: 'theory', label: 'Theory Lab' },
  { id: 'notes', label: 'Notes' },
  { id: 'scales', label: 'Scales' },
  { id: 'chords', label: 'Chords & Harmony' },
  { id: 'progressions', label: 'Progressions' },
  { id: 'arpeggios', label: 'Arpeggios' },
  { id: 'runs', label: 'Runs' },
  { id: 'tips', label: 'Tips' },
  { id: 'library', label: 'Knowledge Library' },
] as const;
type Tab = typeof TABS[number]['id'];

const noteLessons: Lesson[] = keyNotes.map((n, i) => ({
  id: 'note-' + i, title: n.name + ' · ' + n.degree, sub: n.label,
  category: 'F♯ major · scale degree', description: n.role, feel: n.role,
  notes: [n.midi], rh: [n.name + '4'], lh: [], bpm: 72,
  tip: n.role + ' Play it, listen to its relationship with F♯, then use it to build a short phrase.',
}));

const descriptions: Record<Tab, { title: string; copy: string }> = {
  theory: { title: 'Music theory lab', copy: 'Generate scales, chord qualities, inversions, slash chords, arpeggios and progressions across all 12 keys.' },
  notes: { title: 'The notes of F♯', copy: 'Learn the seven notes of the F♯ major scale and understand the role each degree plays.' },
  scales: { title: 'Scales in F♯', copy: 'Major, minor, modes, pentatonics and blues. Play every scale in a clean, ascending register.' },
  chords: { title: 'Chords & harmony', copy: 'Explore F♯ chord voicings, harmonised scale families and the sound of each chord quality.' },
  progressions: { title: 'Progressions', copy: 'Explore jazz, worship, praise and gospel progressions, slash-chord bass inversions, and separate left- and right-hand voicings.' },
  arpeggios: { title: 'Arpeggios', copy: 'Hear chord tones one at a time, moving smoothly up and back down.' },
  runs: { title: 'Runs & licks', copy: 'Short musical connectors, chord-tone phrases and tasteful fills. Left-hand examples only.' },
  tips: { title: 'Practice notes', copy: 'Practical advice for touch, timing, harmony and developing a musical feel.' },
  library: { title: 'Knowledge library', copy: 'Browse the structured music knowledge stored in your JazzClass Supabase database.' },
};

export default function App() {
  const [tab, setTab] = useState<Tab>('notes');
  const [selection, setSelection] = useState<Lesson | null>(null);
  const [query, setQuery] = useState('');
  const [tempo, setTempo] = useState(72);
  const [velocity, setVelocity] = useState(50);
  const [volume, setVolume] = useState(75);
  const [loop, setLoop] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [showFamilies, setShowFamilies] = useState(true);
  const [scaleMode, setScaleMode] = useState<'notes'|'harmonized'>('notes');
  const [scaleQuality, setScaleQuality] = useState<'major'|'minor'|'sus2'|'sus4'>('major');
  const [progressionMode, setProgressionMode] = useState<'standard'|'slash'>('standard');
  const [genre, setGenre] = useState('All');
  const [liveNotes, setLiveNotes] = useState<number[]>([]);
  const [leftLiveNotes, setLeftLiveNotes] = useState<number[]>([]);
  const [rightLiveNotes, setRightLiveNotes] = useState<number[]>([]);
  const [playedNotes, setPlayedNotes] = useState<number[]>([]);
  const { playing, stepIndex, stepNotes, stepLabel, play, stop } = usePlayback();

  const data = useMemo(() => {
    let items: Lesson[] = [];
    if (tab === 'theory') items = [];
    if (tab === 'notes') items = noteLessons;
    if (tab === 'scales') items = scaleMode === 'notes' ? scales : scales.filter(s => s.id === 'scale-0' || s.id === 'scale-1').map(s => {
      const pcs = (s.notes as string[]).map(n => ({C:0,'C♯':1,D:2,'D♯':3,E:4,F:5,'F♯':6,G:7,'G♯':8,A:9,'A♯':10,B:11} as Record<string,number>)[n] ?? 0);
      const intervals = scaleQuality === 'major' ? [0,4,7] : scaleQuality === 'minor' ? [0,3,7] : scaleQuality === 'sus2' ? [0,2,7] : [0,5,7];
      const steps = pcs.map((p,i) => { let root=54+((p-6+12)%12); if(i>0 && root < 54) root += 12; const chord=intervals.map(v => note(root+v)); return {name: s.title.replace(' harmonised','')+' · degree '+(i+1),lh:[],rh:chord,beats:1.5}; });
      return {...s,id:s.id+'-harm-'+scaleQuality,title:s.title+' · '+scaleQuality.toUpperCase()+' chords',category:'Harmonised scale · '+scaleQuality,description:'Each scale degree is voiced as a '+scaleQuality+' chord. All right-hand chord tones sound simultaneously.',lh:[],rh:steps[0].rh,steps,notes:steps.map(x=>x.name)};
    });
    if (tab === 'chords') items = [...chords, ...harmonies, ...(showFamilies ? chordScales : [])];
    if (tab === 'progressions') items = (progressionMode === 'slash' ? slashChords : progressions).filter(x => genre === 'All' || x.category === genre);
    if (tab === 'arpeggios') items = arpeggios;
    if (tab === 'runs') items = runs;
    const q = query.trim().toLowerCase();
    return q ? items.filter(x => [x.title, x.sub, x.category, x.feel, x.tip].join(' ').toLowerCase().includes(q)) : items;
  }, [tab, query, showFamilies, scaleMode, scaleQuality, progressionMode, genre]);

  useEffect(() => {
    if (!metronome) return;
    let count = 0;
    let timer = 0;
    const tick = () => {
      playMetronomeTick(count % 4 === 0);
      count += 1;
      timer = window.setTimeout(tick, 60000 / tempo);
    };
    void unlockAudio().then(tick);
    return () => window.clearTimeout(timer);
  }, [metronome, tempo]);

  useEffect(() => () => closeAudio(), []);

  const stopPlayback = () => {
    stop();
    setLiveNotes([]);
    setLeftLiveNotes([]);
    setRightLiveNotes([]);
  };

  const handlePlay = async (item: Lesson) => {
    if (playing && selection?.id === item.id) {
      stopPlayback();
      return;
    }
    stopPlayback();
    setSelection(item);
    setPlayedNotes([]);
    const isProgression = tab === 'progressions';
    const sourceSteps = item.steps?.length
      ? item.steps.map(s => {
          const lh = isProgression ? s.lh.map(midi) : [];
          const rh = isProgression ? s.rh.map(midi) : (tab === 'runs' ? [] : s.rh.map(midi));
          return { notes: [...lh, ...rh], lh, rh, beats: s.beats ?? 2, label: s.name };
        })
      : (tab === 'runs' ? item.lh : item.rh).map(n => ({ notes: [midi(n)], lh: [], rh: [midi(n)], beats: 0.5, label: n }));
    const playable = { id: item.id, title: item.title, sub: item.sub ?? '', bpm: tempo, loop, steps: sourceSteps };
    await unlockAudio();
    play(playable, (notes, lh, rh) => {
      setLiveNotes(notes);
      setLeftLiveNotes(lh);
      setRightLiveNotes(rh);
      setPlayedNotes(old => [...notes, ...old].slice(0, 28));
    }, () => { setLiveNotes([]); setLeftLiveNotes([]); setRightLiveNotes([]); }, velocity / 100 * volume / 100);
  };

  const handleTheoryPlay = async (notes:number[], left:number[], right:number[], title:string, sequence?:{notes:number[];left:number[];right:number[];label:string;beats?:number}[]) => {
    stopPlayback();
    setSelection(null);
    setPlayedNotes([]);
    await unlockAudio();
    const steps = sequence?.length
      ? sequence.map(step => ({notes:step.notes,lh:step.left,rh:step.right,beats:step.beats ?? 1,label:step.label}))
      : [{notes,lh:left,rh:right,beats:2,label:title}];
    play({id:'theory-'+title,title,sub:'Generated in JazzClass Music Engine',bpm:tempo,loop,steps},(all,lh,rh)=>{
      setLiveNotes(all);setLeftLiveNotes(lh);setRightLiveNotes(rh);
      setPlayedNotes(old=>[...all,...old].slice(0,28));
    },()=>{setLiveNotes([]);setLeftLiveNotes([]);setRightLiveNotes([]);},velocity/100*volume/100);
  };

  const handleStep = async (item: Lesson, index: number) => {
    const step=item.steps?.[index]; if(!step)return; stopPlayback(); setSelection(item); await unlockAudio();
    const lh = tab === 'progressions' ? step.lh.map(midi) : [];
    const rh = tab === 'progressions' ? step.rh.map(midi) : (tab === 'runs' ? [] : step.rh.map(midi));
    const notes = [...lh, ...rh];
    play({id:item.id+'-step-'+index,title:item.title,sub:step.name,bpm:tempo,loop:false,steps:[{notes,lh,rh,beats:2,label:step.name}]},(all,left,right)=>{setLiveNotes(all);setLeftLiveNotes(left);setRightLiveNotes(right);},()=>{setLiveNotes([]);setLeftLiveNotes([]);setRightLiveNotes([]);},velocity/100*volume/100);
  };

  const handleKey = async (m: number) => {
    await unlockAudio();
    playNote(m, { duration: 1.5, velocity: velocity / 100 * volume / 100 });
    setLiveNotes([m]);
    setLeftLiveNotes([]);
    setRightLiveNotes([]);
    setPlayedNotes(old => [m, ...old].slice(0, 28));
    window.setTimeout(() => setLiveNotes(old => old.filter(n => n !== m)), 900);
  };

  const active = playing && stepNotes.length ? stepNotes : liveNotes;
  const activeLeft = leftLiveNotes;
  const activeRight = rightLiveNotes;
  const current = selection ?? data[0] ?? null;
  const header = descriptions[tab];

  return <div className="studio-shell">
    <header className="studio-header">
      <div className="brand-lockup"><span className="brand-mark">F♯</span><span><b>JAZZCLASS</b><small>PIANO STUDIO · ALL 12 KEYS</small></span></div>
      <span className="header-pill"><i /> ALL-KEY THEORY</span>
    </header>

    <section className="hero">
      <div className="hero-kicker"><i /> PIANO STUDIO · ONE KEY ONLY</div>
      <h1>Understand music.<br /><em>Play every key.</em></h1>
      <p>Explore all 12 keys, scales, chords, inversions, voicings, harmony, progressions, arpeggios and professional musical vocabulary.</p>
      <div className="hero-foot"><span>LISTEN · SEE · PLAY</span><span>DEFAULT TEMPO · 72 BPM</span></div>
    </section>

    <TabBar tabs={TABS as readonly {id:string;label:string}[]} active={tab} onChange={(id) => {
      stopPlayback(); setTab(id as Tab); setSelection(null); setQuery('');
    }} />

    <main className="studio-main">
      <section className="catalog">
        <div className="catalog-heading">
          <SectionIntro title={header.title} copy={header.copy} meta={data.length + ' LESSONS'} />
          {tab !== 'tips' && <input className="lesson-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a lesson…" aria-label="Find a lesson" />}
        </div>
        {tab === 'scales' && <div className="family-switch"><button className={scaleMode==='notes'?'selected':''} onClick={()=>setScaleMode('notes')}>Single notes</button><button className={scaleMode==='harmonized'?'selected':''} onClick={()=>setScaleMode('harmonized')}>Harmonised chords</button>{scaleMode==='harmonized' && <select value={scaleQuality} onChange={e=>setScaleQuality(e.target.value as typeof scaleQuality)}><option value="major">Major</option><option value="minor">Minor</option><option value="sus2">Sus2</option><option value="sus4">Sus4</option></select>}</div>}
        {tab === 'progressions' && <div className="family-switch"><button className={progressionMode==='standard'?'selected':''} onClick={()=>{setProgressionMode('standard');setGenre('All')}}>Chord progressions</button><button className={progressionMode==='slash'?'selected':''} onClick={()=>{setProgressionMode('slash');setGenre('All')}}>Slash chords</button><select value={genre} onChange={e=>setGenre(e.target.value)}>{['All','Jazz','Worship','Praise','Gospel'].map(g=><option key={g}>{g}</option>)}</select></div>}
        {tab === 'chords' && <div className="family-switch"><button className={showFamilies ? 'selected' : ''} onClick={() => setShowFamilies(true)}>Chord-scale families</button><button className={!showFamilies ? 'selected' : ''} onClick={() => setShowFamilies(false)}>Chord voicings only</button></div>}
        {tab === 'theory' ? <TheoryLab onPlay={handleTheoryPlay} /> : tab === 'library' ? <KnowledgeLibrary /> : tab === 'tips' ? <div className="tips-list">{tips.map((tip, i) => <article className="tip-card" key={tip.title}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{tip.title}</h3><p>{tip.body}</p></div></article>)}</div> :
          <div className="lesson-grid">{data.map(item => <PlayCard key={item.id} item={item} active={selection?.id === item.id} playing={playing && selection?.id === item.id} activeNotes={active} onPlay={() => void handlePlay(item)} />)}</div>}
        {!data.length && tab !== 'tips' && <div className="empty-state">No lessons match that search.</div>}
      </section>

      <aside className="lesson-detail">
        <div className="detail-kicker">LESSON DETAILS</div>
        {current ? <>
          <h2>{current.title}</h2><span className="detail-sub">{current.sub || current.category}</span>
          <p className="detail-copy">{current.feel ?? current.description}</p>
          {tab === 'progressions' ? <><div className="hand-card left-hand"><b>LEFT HAND · GREEN · BASS / SLASH NOTE</b><p>{current.lh.join('  ·  ') || '—'}</p><small>Green markers · left hand</small></div><div className="hand-card green-hand"><b>RIGHT HAND · YELLOW · CHORD VOICING</b><p>{current.rh.join('  ·  ') || '—'}</p><small>Yellow markers · right-hand chord tones</small></div></> : tab === 'runs' ? <div className="hand-card left-hand"><b>LEFT HAND</b><p>{current.lh.join('  ·  ') || '—'}</p><small>Left-hand notes · green markers</small></div> : <div className="hand-card right-hand"><b>RIGHT HAND</b><p>{current.rh.join('  ·  ') || current.notes?.join(' · ') || '—'}</p><small>Scale and chord notes · yellow markers</small></div>}
          {current.steps?.length ? <div className="step-list"><b>CHORD-BY-CHORD MOVEMENT</b>{current.steps.map((step, i) => <button type="button" className={'step-row ' + (stepIndex === i ? 'step-active' : '')} key={step.name} onClick={() => void handleStep(current, i)}><span>{String(i + 1).padStart(2, '0')} · {step.name}</span><small>{tab === 'progressions' ? 'LH '+step.lh.join(' + ')+'  ·  RH '+step.rh.join(' + ') : 'RH ' + step.rh.join(' + ')}</small><em>▶</em></button>)}</div> : null}
          <div className="playing-tip"><b>PLAYING TIP</b><p>{current.tip}</p>{current.target && <small>Suggested destination: {current.target}</small>}</div>
          <div className="detail-actions"><button className="play-primary" onClick={() => void handlePlay(current)}>{playing && selection?.id === current.id ? 'Ⅱ PAUSE / STOP' : '▶ PLAY LESSON'}</button><button className="stop-button" onClick={stopPlayback}>■ Stop</button></div>
        </> : <div className="empty-state">Choose a lesson to see its notes, hand position and practice advice.</div>}
      </aside>
    </main>

    <section className="practice-panel">
      <div className="practice-heading"><div><div className="detail-kicker">LIVE PIANO · EVERY NOTE IS VISIBLE</div><h2>Practice keyboard</h2><p>White and black keys only. Green = left hand · yellow = right hand · amber = free play.</p></div><span className="audio-badge"><i /> BROWSER AUDIO ENGINE</span></div>
      <div className="now-playing"><b>NOW PLAYING</b><div>{playedNotes.length ? playedNotes.map((n, i) => <span key={i} className={active.includes(n) ? 'note-chip active-chip' : 'note-chip'}>{note(n)}</span>) : <small>Notes and chord tones will appear here as they sound.</small>}</div></div>
      <div className="practice-controls">
        <label>TEMPO <strong>{tempo} BPM</strong><input type="range" min="48" max="120" value={tempo} onChange={e => setTempo(+e.target.value)} /></label>
        <label>TOUCH / VELOCITY <strong>{velocity}%</strong><input type="range" min="20" max="100" value={velocity} onChange={e => setVelocity(+e.target.value)} /></label>
        <label>OUTPUT <strong>{volume}%</strong><input type="range" min="10" max="100" value={volume} onChange={e => setVolume(+e.target.value)} /></label>
        <label className="check-control"><input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} /> Loop lesson</label>
        <label className="check-control"><input type="checkbox" checked={metronome} onChange={e => setMetronome(e.target.checked)} /> Metronome</label>
        <button className="stop-button" onClick={stopPlayback}>■ Stop playback</button>
      </div>
      <p className="audio-footnote">Progressions and slash chords play both hands together: green marks left-hand bass notes and yellow marks right-hand chord tones. Piano tones are generated locally with the Web Audio API — no sample library or piano plug-in is downloaded. Audio begins after your first tap, as required by browser autoplay rules.</p>
    </section>

    <footer className="studio-footer"><b>JAZZCLASS · MUSIC KNOWLEDGE STUDIO</b><span>LEARN THE CHORDS · HEAR THE VOICES · PLAY WITH FEEL</span></footer>
    <PianoDock title={selection?.title ?? 'Free play'} sub={playing ? stepLabel || selection?.sub || '' : selection?.sub || 'tap a key'} activeNotes={active} leftNotes={activeLeft} rightNotes={activeRight} playing={playing} onKey={handleKey} onStop={stopPlayback} />
  </div>;
}
