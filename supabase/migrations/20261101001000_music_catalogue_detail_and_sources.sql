-- Extend the music catalogue with ordered, queryable musical elements and source provenance.
create table if not exists public.scale_degrees (
 id uuid primary key default gen_random_uuid(),
 scale_id uuid not null references public.scale_definitions(id) on delete cascade,
 degree smallint not null,
 semitones smallint not null,
 note_pc smallint not null check(note_pc between 0 and 11),
 degree_label text,
 unique(scale_id,degree)
);
create table if not exists public.chord_tones (
 id uuid primary key default gen_random_uuid(),
 chord_id uuid not null references public.chord_definitions(id) on delete cascade,
 tone_order smallint not null,
 semitones smallint not null,
 interval_name text,
 note_pc smallint not null check(note_pc between 0 and 11),
 unique(chord_id,tone_order)
);
create table if not exists public.harmony_voices (
 id uuid primary key default gen_random_uuid(),
 pattern_id uuid not null references public.harmony_patterns(id) on delete cascade,
 voice_number smallint not null,
 interval_from_root smallint not null,
 octave_offset smallint not null default 0,
 voice_label text,
 unique(pattern_id,voice_number)
);
create table if not exists public.lick_notes (
 id uuid primary key default gen_random_uuid(),
 lick_id uuid not null references public.lick_patterns(id) on delete cascade,
 note_order smallint not null,
 semitones_from_root smallint not null,
 duration_beats numeric(5,2) not null default 0.5,
 accent boolean not null default false,
 articulation text,
 unique(lick_id,note_order)
);
create table if not exists public.lick_variations (
 id uuid primary key default gen_random_uuid(),
 lick_id uuid not null references public.lick_patterns(id) on delete cascade,
 title text not null,
 variation_notes smallint[] not null,
 rhythm jsonb not null default '[]',
 variation_type text not null default 'rhythmic'
);
create table if not exists public.tags (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 label text not null,
 category text not null
);
create table if not exists public.content_tags (
 id uuid primary key default gen_random_uuid(),
 tag_id uuid not null references public.tags(id) on delete cascade,
 content_table text not null,
 content_id uuid not null,
 unique(tag_id,content_table,content_id)
);
create index if not exists scale_degrees_order_idx on public.scale_degrees(scale_id,degree);
create index if not exists chord_tones_order_idx on public.chord_tones(chord_id,tone_order);
create index if not exists lick_notes_order_idx on public.lick_notes(lick_id,note_order);
create index if not exists content_tags_lookup_idx on public.content_tags(content_table,content_id);

alter table public.scale_degrees enable row level security;
alter table public.chord_tones enable row level security;
alter table public.harmony_voices enable row level security;
alter table public.lick_notes enable row level security;
alter table public.lick_variations enable row level security;
alter table public.tags enable row level security;
alter table public.content_tags enable row level security;
grant select on public.scale_degrees,public.chord_tones,public.harmony_voices,public.lick_notes,public.lick_variations,public.tags,public.content_tags to anon,authenticated;
create policy "read scale degrees" on public.scale_degrees for select to anon,authenticated using(true);
create policy "read chord tones" on public.chord_tones for select to anon,authenticated using(true);
create policy "read harmony voices" on public.harmony_voices for select to anon,authenticated using(true);
create policy "read lick notes" on public.lick_notes for select to anon,authenticated using(true);
create policy "read lick variations" on public.lick_variations for select to anon,authenticated using(true);
create policy "read tags" on public.tags for select to anon,authenticated using(true);
create policy "read content tags" on public.content_tags for select to anon,authenticated using(true);

insert into public.sources(title,author,publisher,url,publication_year,license,source_type,notes,verified_at) values
 ('Open Music Theory, Version 2','Mark Gotham, Kyle Gullings, Chelsey Hamm, Bryn Hughes, Brian Jarvis, Megan Lavengood, John Peterson','Virtual Library of Virginia','https://viva.pressbooks.pub/openmusictheory/',2023,'CC BY-SA 4.0','open_textbook','Reference for fundamentals, diatonic and chromatic harmony, jazz, popular music, rhythm, counterpoint and orchestration. Reuse only with required attribution and ShareAlike terms.',now()),
 ('Understanding Music Theory','Catherine Schmidt-Jones','Open educational resource','https://quadriviumpress.com/understandingMusicTheory/',2021,'Creative Commons (see individual source attribution)','open_textbook','Reference for notation, scales, intervals, chords, harmonic analysis, modes and transposition. Verify the exact licence on each adapted section.',now()),
 ('music21 chord module reference','music21 project','music21 documentation','https://music21.org/music21docs/moduleReference/moduleChord.html',null,'BSD-3-Clause (project software)','technical_documentation','Technical reference for chord construction, chord identification, inversion and pitch handling. Use as implementation guidance, not as a substitute for editorial music pedagogy.',now()),
 ('music21 Roman numeral analysis reference','music21 project','music21 documentation','https://music21.org/music21docs/_modules/music21/roman.html',null,'BSD-3-Clause (project software)','technical_documentation','Technical reference for key-relative Roman numeral and harmonic-function analysis.',now()),
 ('Fundamentals of Music Theory','Nikki Moran, Lorna M. Campbell et al.','University of Edinburgh Open.Ed','https://open.ed.ac.uk/fundamentals-of-music-theory-open-textbook/',2021,'CC BY-NC-SA 4.0','open_textbook','University-level open textbook covering notation, pitch, scales, intervals, harmony, cadence and modulation. Non-commercial ShareAlike restriction applies.',now()),
 ('Integrated Music Theory','Sean Butterfield','University of Idaho','https://intmus.github.io/inttheory/',2025,'CC BY-NC-SA 4.0','open_textbook','Open interactive text covering pitches, scales, keys, intervals, triads, seventh chords, lead-sheet notation, rhythm and counterpoint. Non-commercial ShareAlike restriction applies.',now())
on conflict do nothing;

insert into public.tags(slug,label,category) values
 ('jazz','Jazz','style'),('gospel','Gospel','style'),('worship','Worship','style'),('blues','Blues','style'),
 ('beginner','Beginner','level'),('intermediate','Intermediate','level'),('advanced','Advanced','level'),
 ('left-hand','Left hand','technique'),('right-hand','Right hand','technique'),('voice-leading','Voice leading','technique'),
 ('passing-chords','Passing chords','technique'),('improvisation','Improvisation','technique')
on conflict(slug) do nothing;
