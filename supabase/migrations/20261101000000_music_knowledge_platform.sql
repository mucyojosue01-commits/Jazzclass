-- JazzClass music knowledge platform
-- Versioned schema foundation. Public users can read curated knowledge; only owners can write personal learning data.
create extension if not exists pgcrypto;

create table if not exists public.music_keys (
  id uuid primary key default gen_random_uuid(),
  tonic_pc smallint not null check (tonic_pc between 0 and 11),
  spelling text not null,
  mode_family text not null default 'major',
  key_signature smallint not null default 0,
  unique (spelling, mode_family)
);
create table if not exists public.scale_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  family text not null,
  intervals smallint[] not null,
  description text not null default '',
  source_quality text not null default 'editorial'
);
create table if not exists public.chord_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  family text not null,
  intervals smallint[] not null,
  symbol text not null,
  description text not null default ''
);
create table if not exists public.scale_definitions (
  id uuid primary key default gen_random_uuid(),
  key_id uuid not null references public.music_keys(id) on delete cascade,
  scale_type_id uuid not null references public.scale_types(id),
  notes smallint[] not null,
  generated boolean not null default true,
  unique(key_id, scale_type_id)
);
create table if not exists public.chord_definitions (
  id uuid primary key default gen_random_uuid(),
  key_id uuid not null references public.music_keys(id) on delete cascade,
  chord_type_id uuid not null references public.chord_types(id),
  root_pc smallint not null check(root_pc between 0 and 11),
  symbol text not null,
  notes smallint[] not null,
  function_label text,
  generated boolean not null default true
);
create table if not exists public.chord_voicings (
  id uuid primary key default gen_random_uuid(),
  chord_id uuid not null references public.chord_definitions(id) on delete cascade,
  name text not null,
  inversion smallint not null default 0 check(inversion >= 0),
  voicing_notes smallint[] not null,
  left_hand smallint[] not null default '{}',
  right_hand smallint[] not null default '{}',
  register_label text,
  style text,
  difficulty smallint check(difficulty between 1 and 5),
  is_featured boolean not null default false
);
create table if not exists public.progression_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  style text not null,
  roman_numerals text[] not null,
  description text not null default '',
  difficulty smallint not null default 1 check(difficulty between 1 and 5),
  tempo_min smallint,
  tempo_max smallint,
  source_quality text not null default 'editorial'
);
create table if not exists public.progression_steps (
  id uuid primary key default gen_random_uuid(),
  progression_id uuid not null references public.progression_templates(id) on delete cascade,
  step_index smallint not null,
  roman_numeral text not null,
  function_label text,
  beats numeric(5,2) not null default 2,
  chord_quality text,
  left_hand_formula smallint[] not null default '{}',
  right_hand_formula smallint[] not null default '{}',
  unique(progression_id, step_index)
);
create table if not exists public.progression_realizations (
  id uuid primary key default gen_random_uuid(),
  progression_id uuid not null references public.progression_templates(id) on delete cascade,
  key_id uuid not null references public.music_keys(id) on delete cascade,
  chord_symbols text[] not null,
  voicing_data jsonb not null default '[]',
  unique(progression_id, key_id)
);
create table if not exists public.slash_chords (
  id uuid primary key default gen_random_uuid(),
  chord_id uuid not null references public.chord_definitions(id) on delete cascade,
  bass_pc smallint not null check(bass_pc between 0 and 11),
  bass_interval smallint not null,
  symbol text not null,
  left_hand smallint[] not null default '{}',
  right_hand smallint[] not null default '{}',
  function_label text
);
create table if not exists public.harmony_patterns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  family text not null,
  voices smallint not null default 2 check(voices between 2 and 8),
  motion text,
  spacing text,
  interval_formula smallint[] not null,
  description text not null default ''
);
create table if not exists public.arpeggio_patterns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  chord_type_id uuid references public.chord_types(id),
  interval_steps smallint[] not null,
  direction text not null default 'up_down',
  octave_span smallint not null default 1,
  rhythm text,
  hand text not null default 'right'
);
create table if not exists public.lick_patterns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  style text not null,
  notes_formula smallint[] not null,
  rhythm jsonb not null default '[]',
  target_chord_types text[] not null default '{}',
  target_functions text[] not null default '{}',
  hand text not null default 'right',
  difficulty smallint not null default 2 check(difficulty between 1 and 5),
  explanation text not null default '',
  variations jsonb not null default '[]'
);
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  level text not null default 'beginner',
  style text,
  published boolean not null default false,
  sort_order integer not null default 0
);
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  slug text not null unique,
  title text not null,
  category text not null,
  level text not null default 'beginner',
  objectives text[] not null default '{}',
  summary text not null default '',
  estimated_minutes smallint,
  published boolean not null default false,
  sort_order integer not null default 0
);
create table if not exists public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  section_index smallint not null,
  heading text not null,
  body text not null default '',
  example_data jsonb not null default '{}',
  unique(lesson_id, section_index)
);
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  exercise_type text not null,
  prompt text not null,
  answer_data jsonb not null default '{}',
  musical_data jsonb not null default '{}',
  difficulty smallint not null default 1 check(difficulty between 1 and 5)
);
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  publisher text,
  url text,
  publication_year smallint,
  license text,
  source_type text not null default 'reference',
  notes text,
  verified_at timestamptz
);
create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  content_table text not null,
  content_id uuid not null,
  attribution text,
  relationship text not null default 'informed_by',
  unique(source_id, content_table, content_id)
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  media_type text not null,
  title text,
  duration_ms integer,
  license text,
  attribution text,
  metadata jsonb not null default '{}'
);
create table if not exists public.user_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, item_type, item_id)
);
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  key_spelling text,
  focus_area text,
  bpm smallint,
  duration_seconds integer,
  notes jsonb not null default '{}'
);
create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check(status in ('not_started','in_progress','completed')),
  progress_percent smallint not null default 0 check(progress_percent between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index if not exists chord_voicings_chord_idx on public.chord_voicings(chord_id, inversion);
create index if not exists progression_steps_order_idx on public.progression_steps(progression_id, step_index);
create index if not exists lessons_course_order_idx on public.lessons(course_id, sort_order);
create index if not exists content_sources_content_idx on public.content_sources(content_table, content_id);
create index if not exists practice_sessions_user_date_idx on public.practice_sessions(user_id, started_at desc);

-- Curated theory is readable without sign-in; personal records are private to their owner.
do $$
declare t text;
begin
  foreach t in array array[
    'music_keys','scale_types','chord_types','scale_definitions','chord_definitions',
    'chord_voicings','progression_templates','progression_steps','progression_realizations',
    'slash_chords','harmony_patterns','arpeggio_patterns','lick_patterns','courses',
    'lessons','lesson_sections','exercises','sources','content_sources','media_assets',
    'user_library','practice_sessions','user_lesson_progress'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

grant select on public.music_keys, public.scale_types, public.chord_types, public.scale_definitions,
  public.chord_definitions, public.chord_voicings, public.progression_templates, public.progression_steps,
  public.progression_realizations, public.slash_chords, public.harmony_patterns, public.arpeggio_patterns,
  public.lick_patterns, public.courses, public.lessons, public.lesson_sections, public.exercises,
  public.sources, public.content_sources, public.media_assets to anon, authenticated;
grant select, insert, update, delete on public.user_library, public.practice_sessions, public.user_lesson_progress to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'music_keys','scale_types','chord_types','scale_definitions','chord_definitions',
    'chord_voicings','progression_templates','progression_steps','progression_realizations',
    'slash_chords','harmony_patterns','arpeggio_patterns','lick_patterns','courses',
    'lessons','lesson_sections','exercises','sources','content_sources','media_assets'
  ] loop
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', 'read_'||t, t);
  end loop;
end $$;

create policy "users manage their own library" on public.user_library for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their own practice" on public.practice_sessions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage their own lesson progress" on public.user_lesson_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into public.scale_types(slug,name,family,intervals,description) values
 ('major','Major / Ionian','major','{0,2,4,5,7,9,11}','The major scale.'),
 ('natural_minor','Natural minor / Aeolian','minor','{0,2,3,5,7,8,10}','Natural minor.'),
 ('harmonic_minor','Harmonic minor','minor','{0,2,3,5,7,8,11}','Minor with a raised seventh.'),
 ('melodic_minor','Melodic minor','minor','{0,2,3,5,7,9,11}','Jazz melodic minor ascending form.'),
 ('dorian','Dorian','mode','{0,2,3,5,7,9,10}','Minor mode with a natural sixth.'),
 ('phrygian','Phrygian','mode','{0,1,3,5,7,8,10}','Minor mode with a flat second.'),
 ('lydian','Lydian','mode','{0,2,4,6,7,9,11}','Major mode with a raised fourth.'),
 ('mixolydian','Mixolydian','mode','{0,2,4,5,7,9,10}','Dominant mode with a flat seventh.'),
 ('locrian','Locrian','mode','{0,1,3,5,6,8,10}','Diminished mode.'),
 ('major_pentatonic','Major pentatonic','pentatonic','{0,2,4,7,9}','Five-note major collection.'),
 ('minor_pentatonic','Minor pentatonic','pentatonic','{0,3,5,7,10}','Five-note minor collection.'),
 ('blues','Blues','blues','{0,3,5,6,7,10}','Minor blues scale.'),
 ('whole_tone','Whole tone','symmetric','{0,2,4,6,8,10}','Six-note whole-tone collection.'),
 ('diminished_whole_half','Diminished whole-half','symmetric','{0,2,3,5,6,8,9,11}','Symmetric diminished scale.'),
 ('altered','Altered','jazz','{0,1,3,4,6,8,10}','Altered dominant collection.')
on conflict (slug) do nothing;

insert into public.chord_types(slug,name,family,intervals,symbol,description) values
 ('major','Major triad','triad','{0,4,7}','maj','Root, major third, perfect fifth.'),
 ('minor','Minor triad','triad','{0,3,7}','m','Root, minor third, perfect fifth.'),
 ('diminished','Diminished triad','triad','{0,3,6}','dim','Root, minor third, diminished fifth.'),
 ('augmented','Augmented triad','triad','{0,4,8}','aug','Root, major third, augmented fifth.'),
 ('sus2','Suspended second','suspended','{0,2,7}','sus2','Third replaced by second.'),
 ('sus4','Suspended fourth','suspended','{0,5,7}','sus4','Third replaced by fourth.'),
 ('major6','Major sixth','sixth','{0,4,7,9}','6','Major triad with sixth.'),
 ('minor6','Minor sixth','sixth','{0,3,7,9}','m6','Minor triad with sixth.'),
 ('dominant7','Dominant seventh','seventh','{0,4,7,10}','7','Major triad with minor seventh.'),
 ('major7','Major seventh','seventh','{0,4,7,11}','maj7','Major triad with major seventh.'),
 ('minor7','Minor seventh','seventh','{0,3,7,10}','m7','Minor triad with minor seventh.'),
 ('half_diminished7','Half-diminished seventh','seventh','{0,3,6,10}','m7b5','Diminished triad with minor seventh.'),
 ('diminished7','Diminished seventh','seventh','{0,3,6,9}','dim7','Fully diminished seventh.'),
 ('minor9','Minor ninth','extended','{0,3,7,10,14}','m9','Minor seventh with ninth.'),
 ('major9','Major ninth','extended','{0,4,7,11,14}','maj9','Major seventh with ninth.'),
 ('dominant9','Dominant ninth','extended','{0,4,7,10,14}','9','Dominant seventh with ninth.'),
 ('dominant13','Dominant thirteenth','extended','{0,4,7,10,14,21}','13','Dominant extension with thirteenth.'),
 ('dominant7b9','Dominant flat ninth','altered','{0,4,7,10,13}','7b9','Dominant seventh with flat ninth.'),
 ('dominant7sharp9','Dominant sharp ninth','altered','{0,4,7,10,15}','7#9','Dominant seventh with sharp ninth.'),
 ('add9','Add ninth','added-tone','{0,4,7,14}','add9','Major triad with added ninth.')
on conflict (slug) do nothing;

insert into public.music_keys(tonic_pc,spelling,mode_family,key_signature) values
 (0,'C','major',0),(1,'C♯','major',7),(2,'D','major',2),(3,'E♭','major',-3),
 (4,'E','major',4),(5,'F','major',-1),(6,'F♯','major',6),(7,'G','major',1),
 (8,'A♭','major',-4),(9,'A','major',3),(10,'B♭','major',-2),(11,'B','major',5)
on conflict (spelling,mode_family) do nothing;

insert into public.progression_templates(slug,title,style,roman_numerals,description,difficulty) values
 ('jazz-251','Jazz ii–V–I','Jazz','{"ii7","V7","Imaj7"}','The foundational major-key jazz cadence.',2),
 ('gospel-turnaround','Gospel turnaround','Gospel','{"Imaj7","vi7","ii7","V7"}','A common four-chord gospel turnaround.',3),
 ('worship-1564','Worship I–V–vi–IV','Worship','{"I","V","vi","IV"}','A widely used contemporary worship progression.',1),
 ('pop-6415','Pop vi–IV–I–V','Pop','{"vi","IV","I","V"}','A common pop progression.',1),
 ('blues-12bar','Twelve-bar blues','Blues','{"I7","I7","I7","I7","IV7","IV7","I7","I7","V7","IV7","I7","V7"}','Twelve-bar dominant-seventh blues form.',2)
on conflict (slug) do nothing;

insert into public.harmony_patterns(slug,title,family,voices,motion,spacing,interval_formula,description) values
 ('diatonic-thirds','Diatonic thirds','Diatonic',2,'parallel','close','{0,2}','Two-part scale harmony in thirds.'),
 ('diatonic-sixths','Diatonic sixths','Diatonic',2,'parallel','open','{0,5}','Two-part scale harmony in sixths.'),
 ('open-fifths','Open fifths','Open',2,'parallel','open','{0,7}','Root-fifth open voicings.'),
 ('four-part-close','Four-part close harmony','Jazz / Vocal',4,'mixed','close','{0,3,7,10}','Four-note close-position harmony.')
on conflict (slug) do nothing;

insert into public.arpeggio_patterns(slug,title,interval_steps,direction,octave_span,rhythm,hand) values
 ('triad-up-down','Triad up and down','{0,4,7,12}','up_down',1,'even eighth notes','right'),
 ('seventh-up-down','Seventh chord up and down','{0,4,7,10,12}','up_down',1,'even eighth notes','right'),
 ('ninth-up-down','Ninth chord up and down','{0,4,7,10,14,12}','up_down',1,'even eighth notes','right')
on conflict (slug) do nothing;
