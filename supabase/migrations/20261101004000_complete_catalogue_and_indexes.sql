-- JazzClass catalogue completion and query-performance indexes.
create index if not exists arpeggio_patterns_chord_type_idx on public.arpeggio_patterns(chord_type_id);
create index if not exists chord_definitions_chord_type_idx on public.chord_definitions(chord_type_id);
create index if not exists exercises_lesson_idx on public.exercises(lesson_id);
create index if not exists lick_variations_lick_idx on public.lick_variations(lick_id);
create index if not exists progression_realizations_progression_idx on public.progression_realizations(progression_id);
create index if not exists scale_definitions_scale_type_idx on public.scale_definitions(scale_type_id);
create index if not exists slash_chords_chord_idx on public.slash_chords(chord_id);
create index if not exists user_lesson_progress_lesson_idx on public.user_lesson_progress(lesson_id);

-- Replace the initial pitch-class-only inversion skeletons with correctly ordered,
-- ascending relative semitone voicings. Inversion changes the bass chord tone.
delete from public.chord_voicings where register_label='Generated pitch-class shape';
with rotated as (
 select cd.id chord_id, inv.i inversion,
        array_agg((u.interval + case when u.ord <= inv.i then 12 else 0 end)::smallint
          order by ((u.ord-1-inv.i+cardinality(ct.intervals))%cardinality(ct.intervals))) tones
 from public.chord_definitions cd
 join public.chord_types ct on ct.id=cd.chord_type_id
 cross join lateral generate_series(0,cardinality(ct.intervals)-1) inv(i)
 cross join lateral unnest(ct.intervals) with ordinality u(interval,ord)
 group by cd.id,inv.i,ct.intervals
)
insert into public.chord_voicings(chord_id,name,inversion,voicing_notes,left_hand,right_hand,register_label,style,difficulty,is_featured)
select chord_id,
 case inversion when 0 then 'Root position' when 1 then 'First inversion' when 2 then 'Second inversion'
 when 3 then 'Third inversion' else 'Inversion '||inversion::text end,
 inversion,tones,array[tones[1]]::smallint[],coalesce(tones[2:cardinality(tones)],'{}'::smallint[]),
 'Relative semitones','Theory engine',greatest(1,least(5,cardinality(tones)-1)),false
from rotated;

-- Materialize all five progression templates in all twelve keys.
with step_roots as (
 select p.id progression_id,k.id key_id,k.tonic_pc,k.spelling,p.slug,p.title,
        ps.step_index,ps.roman_numeral,ps.function_label,ps.beats,ps.chord_quality,
        ps.left_hand_formula,ps.right_hand_formula,
        case lower(regexp_replace(ps.roman_numeral,'[^ivIV]','','g'))
         when 'i' then 0 when 'ii' then 2 when 'iii' then 4 when 'iv' then 5
         when 'v' then 7 when 'vi' then 9 when 'vii' then 11 else 0 end degree_semitones
 from public.progression_templates p
 cross join public.music_keys k
 join public.progression_steps ps on ps.progression_id=p.id
), realized as (
 select *, (tonic_pc+degree_semitones)%12 root_pc,
        case (tonic_pc+degree_semitones)%12
         when 0 then 'C' when 1 then 'C♯' when 2 then 'D' when 3 then 'D♯'
         when 4 then 'E' when 5 then 'F' when 6 then 'F♯' when 7 then 'G'
         when 8 then 'G♯' when 9 then 'A' when 10 then 'A♯' else 'B' end root_name
 from step_roots
)
insert into public.progression_realizations(progression_id,key_id,chord_symbols,voicing_data)
select progression_id,key_id,
 array_agg(root_name||case chord_quality when 'major' then '' when 'minor' then 'm'
   when 'major7' then 'maj7' when 'minor7' then 'm7' when 'dominant7' then '7'
   else coalesce(chord_quality,'') end order by step_index),
 jsonb_agg(jsonb_build_object('step',step_index,'roman',roman_numeral,'root_pc',root_pc,
   'chord_quality',chord_quality,'function',function_label,'beats',beats,
   'left_hand_formula',left_hand_formula,'right_hand_formula',right_hand_formula) order by step_index)
from realized
group by progression_id,key_id
on conflict(progression_id,key_id) do nothing;

-- Slash-chord options: bass notes under a separate upper chord structure.
with bass_intervals(interval) as (values (2::smallint),(4::smallint),(7::smallint),(9::smallint))
insert into public.slash_chords(chord_id,bass_pc,bass_interval,symbol,left_hand,right_hand,function_label)
select cd.id,(cd.root_pc+b.interval)%12,b.interval,
 cd.symbol||'/'||case (cd.root_pc+b.interval)%12
  when 0 then 'C' when 1 then 'C♯' when 2 then 'D' when 3 then 'D♯'
  when 4 then 'E' when 5 then 'F' when 6 then 'F♯' when 7 then 'G'
  when 8 then 'G♯' when 9 then 'A' when 10 then 'A♯' else 'B' end,
 array[((cd.root_pc+b.interval)%12)::smallint],cd.notes,'Bass colour / slash voicing'
from public.chord_definitions cd cross join bass_intervals b
where not exists(select 1 from public.slash_chords s where s.chord_id=cd.id and s.bass_interval=b.interval);

-- Store the voice intervals for the built-in scale-harmony patterns.
insert into public.harmony_voices(pattern_id,voice_number,interval_from_root,octave_offset,voice_label)
select hp.id,u.ord::smallint,u.interval::smallint,0,
 case u.ord when 1 then 'Root' when 2 then 'Second voice' when 3 then 'Third voice'
 when 4 then 'Fourth voice' when 5 then 'Fifth voice' else 'Voice '||u.ord end
from public.harmony_patterns hp
cross join lateral unnest(hp.interval_formula) with ordinality u(interval,ord)
on conflict(pattern_id,voice_number) do nothing;

-- Attach a practical generated exercise to each published lesson.
insert into public.exercises(lesson_id,title,exercise_type,prompt,answer_data,musical_data,difficulty)
select l.id,'Apply: '||l.title,'keyboard_practice',
 'Practise the lesson concept slowly in C, then transpose it through all twelve keys. Record one clean repetition.',
 jsonb_build_object('success_criteria',jsonb_build_array('Correct notes','Steady pulse','Clear sound','Repeat in all twelve keys')),
 jsonb_build_object('lesson_slug',l.slug,'category',l.category,'level',l.level,'tempo_bpm',60),
 case l.level when 'advanced' then 4 when 'intermediate' then 3 else 1 end
from public.lessons l
where l.published=true and not exists(select 1 from public.exercises e where e.lesson_id=l.id);
