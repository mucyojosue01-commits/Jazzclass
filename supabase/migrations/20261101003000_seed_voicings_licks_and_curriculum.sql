-- Generate chord inversions/voicing skeletons and seed an original lesson curriculum.
with rotated as (
 select cd.id as chord_id, inv.i as inversion,
        array_agg(((cd.root_pc+u.interval)%12)::smallint
          order by ((u.ord-1-inv.i+cardinality(ct.intervals))%cardinality(ct.intervals))) as tones
 from public.chord_definitions cd
 join public.chord_types ct on ct.id=cd.chord_type_id
 cross join lateral generate_series(0,cardinality(ct.intervals)-1) as inv(i)
 cross join lateral unnest(ct.intervals) with ordinality as u(interval,ord)
 group by cd.id,inv.i,cd.root_pc,ct.intervals
)
insert into public.chord_voicings(chord_id,name,inversion,voicing_notes,left_hand,right_hand,register_label,style,difficulty,is_featured)
select chord_id,
 case inversion when 0 then 'Root position' when 1 then 'First inversion' when 2 then 'Second inversion'
 when 3 then 'Third inversion' else 'Inversion '||inversion::text end,
 inversion,tones,array[tones[1]]::smallint[],coalesce(tones[2:cardinality(tones)],'{}'::smallint[]),
 'Generated pitch-class shape','Theory engine',greatest(1,least(5,cardinality(tones)-1)),false
from rotated
on conflict do nothing;

insert into public.lick_patterns(slug,title,style,notes_formula,rhythm,target_chord_types,target_functions,hand,difficulty,explanation,variations) values
 ('upper-neighbour-turn','Upper neighbour turn','Jazz','{0,2,1,0}','[0.5,0.5,0.5,1.0]','{"major","major7","minor7"}','{"tonic","predominant"}','right',1,'A short chord-tone turn around the root. Keep the upper neighbour light and resolve clearly.','[{"name":"Descending turn","notes":[0,-1,0]}]'),
 ('dominant-enclosure','Dominant enclosure','Jazz','{7,10,11,9}','[0.5,0.5,0.5,1.0]','{"dominant7","dominant9"}','{"dominant"}','right',3,'Approach the target guide tone from above and below, then resolve into the next chord.','[{"name":"Chromatic enclosure","notes":[8,10,11,9]}]'),
 ('gospel-pickup','Gospel pickup','Gospel','{4,5,9}','[0.5,0.5,1.0]','{"major","major7","dominant7"}','{"tonic","dominant"}','right',2,'A compact three-note pickup into a tonic chord. Leave space for the singer.','[{"name":"Four-note pickup","notes":[4,5,7,9]}]'),
 ('minor-seven-outline','Minor seventh outline','Jazz / R&B','{0,3,7,10}','[0.5,0.5,0.5,1.0]','{"minor7","minor9"}','{"tonic","predominant"}','right',2,'Outline root, minor third, fifth and flat seventh. Use it as a short answer phrase.','[]'),
 ('major-six-nine-fragment','Major 6/9 fragment','Jazz / Worship','{0,4,7,9,14}','[0.5,0.5,0.5,0.5,1.0]','{"major6","major9","add9"}','{"tonic"}','right',2,'A warm major-colour fragment. The sixth and ninth add colour without crowding the harmony.','[]'),
 ('chromatic-lower-approach','Chromatic lower approach','Jazz','{2,1,0}','[0.5,0.5,1.0]','{"major7","dominant7","minor7"}','{"tonic","dominant"}','right',2,'Approach a chord tone from one semitone below and land on the beat.','[{"name":"Upper and lower approach","notes":[2,-1,0]}]'),
 ('dominant-nine-fragment','Dominant ninth fragment','Jazz / Blues','{4,7,10,14}','[0.5,0.5,0.5,1.0]','{"dominant9","dominant13"}','{"dominant"}','right',3,'Use the third, fifth, flat seventh and ninth to outline a dominant chord without playing every note.','[]'),
 ('descending-chord-tones','Descending chord tones','Gospel / Jazz','{11,7,4,0}','[0.5,0.5,0.5,1.0]','{"major7","minor7"}','{"tonic","predominant"}','right',2,'Descend through chord tones rather than running the entire scale.','[]'),
 ('double-note-answer','Double-note answer','Worship / Pop','{0,4,7,4}','[1.0,0.5,0.5,1.0]','{"major","major7","sus4"}','{"tonic","subdominant"}','right',1,'A small melodic contour suitable between vocal lines. Keep the rhythm relaxed.','[]'),
 ('jazz-turnaround-tag','Jazz turnaround tag','Jazz','{7,9,10,11,12}','[0.5,0.5,0.5,0.5,1.0]','{"dominant7","dominant9"}','{"dominant","tonic"}','right',3,'A five-note dominant tag that resolves to the tonic. Keep the last note on a strong beat.','[]')
on conflict(slug) do nothing;

insert into public.lick_notes(lick_id,note_order,semitones_from_root,duration_beats,accent)
select l.id,u.ord::smallint,u.interval::smallint,
       case when u.ord=cardinality(l.notes_formula) then 1.0 else 0.5 end,
       u.ord=cardinality(l.notes_formula)
from public.lick_patterns l
cross join lateral unnest(l.notes_formula) with ordinality as u(interval,ord)
on conflict(lick_id,note_order) do nothing;

insert into public.courses(slug,title,description,level,style,published,sort_order) values
 ('piano-foundations','Piano foundations','Keyboard geography, pitch, intervals, rhythm and practical technique.','beginner','General',true,10),
 ('scales-and-tonality','Scales and tonality','Major, minor, modal, pentatonic, blues and jazz scale language in every key.','beginner','Theory',true,20),
 ('chord-mastery','Chord mastery','Triads, seventh chords, extensions, inversions, voicings and two-hand arrangements.','beginner','Jazz / General',true,30),
 ('harmony-and-voice-leading','Harmony and voice leading','Harmonic function, diatonic harmony, voice leading, reharmonisation and slash chords.','intermediate','Jazz / Gospel',true,40),
 ('progressions-and-styles','Progressions across styles','Jazz, gospel, worship, praise, blues, pop and R&B harmonic patterns.','intermediate','Multi-style',true,50),
 ('improvisation-and-licks','Improvisation, runs and licks','Chord-tone targeting, enclosures, approach notes, motifs and musical phrasing.','intermediate','Jazz / Gospel',true,60),
 ('arpeggios-and-technique','Arpeggios and technique','Chord-tone fluency, hand coordination, patterns, articulation and tempo development.','beginner','Technique',true,70),
 ('advanced-harmony','Advanced harmony','Altered dominants, upper structures, quartal harmony, modal interchange and reharmonisation.','advanced','Jazz',true,80)
on conflict(slug) do nothing;

insert into public.lessons(course_id,slug,title,category,level,objectives,summary,estimated_minutes,published,sort_order)
select c.id,v.slug,v.title,v.category,v.level,v.objectives,v.summary,v.minutes,true,v.sort_order
from (values
 ('piano-foundations','keyboard-geography','Keyboard geography and note names','Foundations','beginner',array['Locate all twelve pitch classes','Identify enharmonic notes','Find notes across octaves'],'Learn the repeating pattern of white and black keys and how pitch names repeat by octave.',15,10),
 ('piano-foundations','intervals-and-semitones','Intervals and semitones','Foundations','beginner',array['Measure semitones','Name common intervals','Hear interval quality'],'Intervals describe the distance between pitches and are the building blocks of scales, chords and melody.',20,20),
 ('piano-foundations','rhythm-and-pulse','Pulse, subdivision and rhythm','Rhythm','beginner',array['Maintain a steady pulse','Count subdivisions','Practise with a metronome'],'Develop reliable time by separating the beat, subdivisions and note durations.',20,30),
 ('scales-and-tonality','major-scale-formula','The major scale formula','Scales','beginner',array['Memorise the whole-step pattern','Build major scales in all keys','Identify scale degrees'],'The major scale follows the interval pattern 2–2–1–2–2–2–1 semitones.',20,10),
 ('scales-and-tonality','minor-scale-families','Natural, harmonic and melodic minor','Scales','beginner',array['Compare three minor forms','Hear the raised leading tone','Build each form in every key'],'Minor tonality has several useful scale forms, each with a distinct melodic and harmonic role.',25,20),
 ('scales-and-tonality','modes-and-modal-colour','Modes and modal colour','Scales','intermediate',array['Build the seven modes','Identify characteristic tones','Match modes to harmony'],'Modes are rotations of a parent scale with characteristic intervals that define their sound.',30,30),
 ('scales-and-tonality','pentatonic-and-blues','Pentatonic and blues language','Scales','beginner',array['Build major and minor pentatonics','Add the blues note','Create short phrases'],'Pentatonic and blues collections provide compact, practical melodic vocabulary.',20,40),
 ('scales-and-tonality','bebop-and-altered-scales','Bebop and altered dominant scales','Scales','advanced',array['Identify chord-scale relationships','Use chromatic passing tones','Resolve altered tensions'],'Jazz scales add chromatic notes and altered tensions that support dominant resolution and line construction.',30,50),
 ('chord-mastery','triad-qualities','Major, minor, diminished and augmented triads','Chords','beginner',array['Build four triad qualities','Identify interval formulas','Play triads in all keys'],'Triad quality is determined by the third and fifth above the root.',20,10),
 ('chord-mastery','seventh-chord-families','Seventh chord families','Chords','beginner',array['Build maj7, m7 and dominant 7','Compare half-diminished and diminished','Identify guide tones'],'Seventh chords add a seventh above the root and form the basis of jazz and gospel harmony.',25,20),
 ('chord-mastery','extended-chords','Ninth, eleventh and thirteenth chords','Chords','intermediate',array['Understand chord extensions','Select essential tones','Avoid muddy registers'],'Extended chords add upper chord tones; practical voicings often omit or redistribute less essential tones.',30,30),
 ('chord-mastery','inversions-versus-voicings','Inversions versus voicings','Chords','intermediate',array['Distinguish bass inversion from note spacing','Generate every inversion','Create close and open voicings'],'An inversion changes which chord tone is lowest. A voicing changes spacing, register and distribution without necessarily changing chord identity.',25,40),
 ('harmony-and-voice-leading','diatonic-harmony','Diatonic harmony and Roman numerals','Harmony','intermediate',array['Harmonise major and minor scales','Label Roman numerals','Identify harmonic function'],'Diatonic harmony builds chords from each scale degree and labels their relationship to the tonic.',30,10),
 ('harmony-and-voice-leading','voice-leading-basics','Smooth voice leading','Harmony','intermediate',array['Track common tones','Move voices by small intervals','Connect inversions smoothly'],'Good voice leading preserves common tones and moves other chord tones by the smallest practical distance.',25,20),
 ('harmony-and-voice-leading','slash-chords','Slash chords and bass inversions','Harmony','intermediate',array['Read slash-chord symbols','Separate bass from upper structure','Use inversions intentionally'],'A slash chord specifies a bass note beneath an upper chord; the bass may be a chord tone or a colour tone.',20,30),
 ('progressions-and-styles','jazz-two-five-one','Jazz ii–V–I progression','Progressions','intermediate',array['Identify predominant, dominant and tonic','Play guide-tone movement','Transpose the cadence'],'The ii–V–I cadence moves from predominant to dominant to tonic and is a core jazz progression.',25,10),
 ('progressions-and-styles','gospel-turnarounds','Gospel turnarounds and passing harmony','Progressions','intermediate',array['Play a four-chord turnaround','Add passing dominants','Connect bass movement'],'Gospel turnarounds create forward motion toward the tonic through functional harmony, bass movement and tasteful passing chords.',30,20),
 ('progressions-and-styles','worship-and-praise','Worship and praise accompaniment','Progressions','beginner',array['Play common four-chord patterns','Use inversions for smooth movement','Balance both hands'],'Effective accompaniment supports the song with stable pulse, economical voicings and controlled dynamics.',25,30),
 ('improvisation-and-licks','chord-tone-targeting','Target chord tones when improvising','Improvisation','intermediate',array['Target thirds and sevenths','Resolve approach notes','Build short phrases'],'Strong improvised lines make the harmony audible by targeting chord tones on strong beats.',30,10),
 ('improvisation-and-licks','enclosures-and-approach-notes','Enclosures and chromatic approaches','Improvisation','advanced',array['Build upper and lower enclosures','Resolve by semitone','Apply to dominant chords'],'An enclosure surrounds a target note from above and below before resolving to the chord tone.',30,20),
 ('arpeggios-and-technique','chord-arpeggios','Chord arpeggios in every key','Technique','beginner',array['Play triad and seventh arpeggios','Practise inversions','Maintain even articulation'],'Arpeggios turn chord formulas into sequential note patterns and build fluency across the keyboard.',20,10),
 ('advanced-harmony','altered-dominants','Altered dominant harmony','Advanced harmony','advanced',array['Identify altered tensions','Choose altered scale colours','Resolve to tonic'],'Altered dominants use tensions such as flat ninth, sharp ninth, sharp eleventh and flat thirteenth to intensify resolution.',35,10)
) as v(course_slug,slug,title,category,level,objectives,summary,minutes,sort_order)
join public.courses c on c.slug=v.course_slug
on conflict(slug) do nothing;

insert into public.lesson_sections(lesson_id,section_index,heading,body,example_data)
select l.id,1,'Core idea',l.summary,
 jsonb_build_object('objectives',to_jsonb(l.objectives),'practice','Play slowly, listen for the sound, then transpose the same idea through all twelve keys.')
from public.lessons l
where l.slug in (
 'keyboard-geography','intervals-and-semitones','major-scale-formula','minor-scale-families',
 'modes-and-modal-colour','triad-qualities','seventh-chord-families','extended-chords',
 'inversions-versus-voicings','diatonic-harmony','voice-leading-basics','slash-chords',
 'jazz-two-five-one','gospel-turnarounds','worship-and-praise','chord-tone-targeting',
 'enclosures-and-approach-notes','chord-arpeggios','altered-dominants'
)
and not exists(select 1 from public.lesson_sections s where s.lesson_id=l.id and s.section_index=1);

insert into public.content_sources(source_id,content_table,content_id,attribution,relationship)
select s.id,'lessons',l.id,
 'Use as a reference; JazzClass lesson wording and exercises are original. Follow the source licence for any future adaptation.',
 'informed_by'
from public.sources s
cross join public.lessons l
where s.title='Open Music Theory, Version 2'
and l.slug in ('major-scale-formula','triad-qualities','seventh-chord-families','diatonic-harmony','jazz-two-five-one','altered-dominants')
on conflict(source_id,content_table,content_id) do nothing;

insert into public.content_sources(source_id,content_table,content_id,attribution,relationship)
select s.id,'lessons',l.id,
 'Reference only; original JazzClass explanation. Check source-specific licence before adapting any material.',
 'informed_by'
from public.sources s
cross join public.lessons l
where s.title='music21 chord module reference'
and l.slug in ('triad-qualities','seventh-chord-families','inversions-versus-voicings','chord-arpeggios')
on conflict(source_id,content_table,content_id) do nothing;
