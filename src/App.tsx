import { useEffect, useMemo, useState } from 'react';
import { midi, note, scales, chordScales, chords, progressions, arpeggios, harmonies, runs, tips, keyNotes, type Lesson } from './music';
import { playNote, unlockAudio, playMetronomeTick, closeAudio } from './lib/pianoAudio';
import PianoDock from './components/PianoDock';
import TabBar from './components/TabBar';
import PlayCard from './components/PlayCard';
import SectionIntro from './components/SectionIntro';
import usePlayback from './hooks/usePlayback';

const TABS = [
  { id: 'notes', label: 'Notes' },
  { id: 'scales', label: 'Scales' },
  { id: 'chords', label: 'Chords & Harmony' },
  { id: 'progressions', label: 'Progressions' },
  { id: 'arpeggios', label: 'Arpeggios' },
  { id: 'runs', label: 'Runs' },
  { id: 'tips', label: 'Tips' },
] as const;
type Tab = typeof TABS[number]['id'];

const noteLessons: Lesson[] = keyNotes.map((n, i) => ({
  id: 'note-' + i, title: n.name + ' · ' + n.degree, sub: n.label,
  category: 'F♯ major · scale degree', description: n.role, feel: n.role,
  notes: [n.midi], rh: [n.name + '4'], lh: [], bpm: 72,
  tip: n.role + ' Play it, listen to its relationship with F♯, then use it to build a short phrase.',
}));

const descriptions: Record<Tab, { title: string; copy: string }> = {
  notes: { title: 'The notes of F♯', copy: 'Learn the seven notes of the F♯ major scale and understand the role each degree plays.' },
  scales: { title: 'Scales in F♯', copy: 'Major, minor, modes, pentatonics and blues. Play every scale in a clean, ascending register.' },
  chords: { title: 'Chords & harmony', copy: 'Explore F♯ chord voicings, harmonised scale families and the sound of each chord quality.' },
  progressions: { title: 'Progressions', copy: 'Practical pop, worship, praise, gospel, jazz and blues movements. These examples are presented as left-hand foundations.' },
  arpeggios: { title: 'Arpeggios', copy: 'Hear chord tones one at a time, moving smoothly up and back down.' },
  runs: { title: 'Runs & licks', copy: 'Short musical connectors, chord-tone phrases and tasteful fills. Left-hand examples only.' },
  tips: { title: 'Practice notes', copy: 'Practical advice for touch, timing, harmony and developing a musical feel.' },
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
  const [liveNotes, setLiveNotes] = useState<number[]>([]);
  const [playedNotes, setPlayedNotes] = useState<number[]>([]);
  const { playing, stepIndex, stepNotes, stepLabel, play, stop } = usePlayback();

  const data = useMemo(() => {
    let items: Lesson[] = [];
    if (tab === 'notes') items = noteLessons;
    if (tab === 'scales') items = scales;
    if (tab === 'chords') items = [...chords, ...harmonies, ...(showFamilies ? chordScales : [])];
    if (tab === 'progressions') items = progressions;
    if (tab === 'arpeggios') items = arpeggios;
    if (tab === 'runs') items = runs;
    const q = query.trim().toLowerCase();
    return q ? items.filter(x => [x.title, x.sub, x.category, x.feel, x.tip].join(' ').toLowerCase().includes(q)) : items;
  }, [tab, query, showFamilies]);

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
  };

  const handlePlay = async (item: Lesson) => {
    if (playing && selection?.id === item.id) {
      stopPlayback();
      return;
    }
    stopPlayback();
    setSelection(item);
    setPlayedNotes([]);
    const isLeftOnly = tab === 'progressions' || tab === 'runs';
    const sourceSteps = item.steps?.length
      ? item.steps.map(s => ({ notes: (isLeftOnly ? s.lh : s.rh).map(midi), beats: s.beats ?? 2, label: s.name }))
      : (isLeftOnly ? item.lh : item.rh).map((n, i) => ({ notes: [midi(n)], beats: tab === 'runs' ? 0.5 : 0.5, label: n }));
    const playable = { id: item.id, title: item.title, sub: item.sub ?? '', bpm: tempo, loop, steps: sourceSteps };
    await unlockAudio();
    play(playable, (notes) => {
      setLiveNotes(notes);
      setPlayedNotes(old => [...notes, ...old].slice(0, 28));
    }, () => setLiveNotes([]), velocity / 100 * volume / 100);
  };

  const handleKey = async (m: number) => {
    await unlockAudio();
    playNote(m, { duration: 1.5, velocity: velocity / 100 * volume / 100 });
    setLiveNotes([m]);
    setPlayedNotes(old => [m, ...old].slice(0, 28));
    window.setTimeout(() => setLiveNotes(old => old.filter(n => n !== m)), 900);
  };

  const active = playing && stepNotes.length ? stepNotes : liveNotes;
  const current = selection ?? data[0] ?? null;
  const header = descriptions[tab];

  return <div className="studio-shell">
    <header className="studio-header">
      <div className="brand-lockup"><span className="brand-mark">F♯</span><span><b>JAZZCLASS</b><small>PIANO STUDIO · ONE KEY ONLY</small></span></div>
      <span className="header-pill"><i /> F♯ CENTRED</span>
    </header>

    <section className="hero">
      <div className="hero-kicker"><i /> PIANO STUDIO · ONE KEY ONLY</div>
      <h1>Learn piano<br /><em>in F♯</em></h1>
      <p>Notes, every scale, chords and harmony, pop, worship, praise, gospel and jazz progressions, arpeggios and short musical runs — all in F♯, all on the keyboard below.</p>
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
        {tab === 'chords' && <div className="family-switch"><button className={showFamilies ? 'selected' : ''} onClick={() => setShowFamilies(true)}>Chord-scale families</button><button className={!showFamilies ? 'selected' : ''} onClick={() => setShowFamilies(false)}>Chord voicings only</button></div>}
        {tab === 'tips' ? <div className="tips-list">{tips.map((tip, i) => <article className="tip-card" key={tip.title}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{tip.title}</h3><p>{tip.body}</p></div></article>)}</div> :
          <div className="lesson-grid">{data.map(item => <PlayCard key={item.id} item={item} active={selection?.id === item.id} playing={playing && selection?.id === item.id} activeNotes={active} onPlay={() => void handlePlay(item)} />)}</div>}
        {!data.length && tab !== 'tips' && <div className="empty-state">No lessons match that search.</div>}
      </section>

      <aside className="lesson-detail">
        <div className="detail-kicker">LESSON DETAILS</div>
        {current ? <>
          <h2>{current.title}</h2><span className="detail-sub">{current.sub || current.category}</span>
          <p className="detail-copy">{current.feel ?? current.description}</p>
          {(tab === 'progressions' || tab === 'runs') ? <div className="hand-card left-hand"><b>LEFT HAND</b><p>{current.lh.join('  ·  ') || '—'}</p><small>Left-hand notes · blue markers</small></div> :
            <div className="hand-card right-hand"><b>RIGHT HAND</b><p>{current.rh.join('  ·  ') || current.notes?.join(' · ') || '—'}</p><small>Scale and chord notes · chocolate markers</small></div>}
          {current.steps?.length ? <div className="step-list"><b>CHORD-BY-CHORD MOVEMENT</b>{current.steps.map((step, i) => <div className={'step-row ' + (stepIndex === i ? 'step-active' : '')} key={step.name}><span>{String(i + 1).padStart(2, '0')} · {step.name}</span><small>LH {step.lh.join(' + ')}</small></div>)}</div> : null}
          <div className="playing-tip"><b>PLAYING TIP</b><p>{current.tip}</p>{current.target && <small>Suggested destination: {current.target}</small>}</div>
          <div className="detail-actions"><button className="play-primary" onClick={() => void handlePlay(current)}>{playing && selection?.id === current.id ? 'Ⅱ PAUSE / STOP' : '▶ PLAY LESSON'}</button><button className="stop-button" onClick={stopPlayback}>■ Stop</button></div>
        </> : <div className="empty-state">Choose a lesson to see its notes, hand position and practice advice.</div>}
      </aside>
    </main>

    <section className="practice-panel">
      <div className="practice-heading"><div><div className="detail-kicker">LIVE PIANO · EVERY NOTE IS VISIBLE</div><h2>Practice keyboard</h2><p>White and black keys only. Blue = left hand · chocolate = right hand · amber = free play.</p></div><span className="audio-badge"><i /> BROWSER AUDIO ENGINE</span></div>
      <div className="now-playing"><b>NOW PLAYING</b><div>{playedNotes.length ? playedNotes.map((n, i) => <span key={i} className={active.includes(n) ? 'note-chip active-chip' : 'note-chip'}>{note(n)}</span>) : <small>Notes and chord tones will appear here as they sound.</small>}</div></div>
      <div className="practice-controls">
        <label>TEMPO <strong>{tempo} BPM</strong><input type="range" min="48" max="120" value={tempo} onChange={e => setTempo(+e.target.value)} /></label>
        <label>TOUCH / VELOCITY <strong>{velocity}%</strong><input type="range" min="20" max="100" value={velocity} onChange={e => setVelocity(+e.target.value)} /></label>
        <label>OUTPUT <strong>{volume}%</strong><input type="range" min="10" max="100" value={volume} onChange={e => setVolume(+e.target.value)} /></label>
        <label className="check-control"><input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} /> Loop lesson</label>
        <label className="check-control"><input type="checkbox" checked={metronome} onChange={e => setMetronome(e.target.checked)} /> Metronome</label>
        <button className="stop-button" onClick={stopPlayback}>■ Stop playback</button>
      </div>
      <p className="audio-footnote">Piano tones are generated locally with the Web Audio API — no sample library or piano plug-in is downloaded. Audio begins after your first tap, as required by browser autoplay rules.</p>
    </section>

    <footer className="studio-footer"><b>JAZZCLASS · F♯ PIANO STUDIO</b><span>LEARN THE CHORDS · HEAR THE VOICES · PLAY WITH FEEL</span></footer>
    <PianoDock title={selection?.title ?? 'Free play'} sub={playing ? stepLabel || selection?.sub || '' : selection?.sub || 'tap a key'} activeNotes={active} playing={playing} onKey={handleKey} onStop={stopPlayback} />
  </div>;
}
