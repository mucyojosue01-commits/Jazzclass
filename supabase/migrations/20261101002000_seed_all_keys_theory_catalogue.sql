-- Populate the reusable theory catalogue for every chromatic tonic.
insert into public.scale_types(slug,name,family,intervals,description) values
 ('bebop_dominant','Bebop dominant','jazz','{0,2,4,5,7,9,10,11}','Eight-note dominant bebop scale.'),
 ('lydian_dominant','Lydian dominant','jazz','{0,2,4,6,7,9,10}','Dominant scale with a raised fourth.'),
 ('phrygian_dominant','Phrygian dominant','modal','{0,1,4,5,7,8,10}','Major third with Phrygian second and sixth.')
on conflict(slug) do nothing;
insert into public.chord_types(slug,name,family,intervals,symbol,description) values
 ('dominant11','Dominant eleventh','extended','{0,4,7,10,14,17}','11','Dominant chord with eleventh extension.'),
 ('quartal','Quartal stack','modern','{0,5,10,15}','quartal','Stacked fourths for modern harmony.')
on conflict(slug) do nothing;

insert into public.scale_definitions(key_id,scale_type_id,notes,generated)
select k.id,s.id,array_agg(((k.tonic_pc + u.interval) % 12)::smallint order by u.ord),true
from public.music_keys k cross join public.scale_types s
cross join lateral unnest(s.intervals) with ordinality as u(interval,ord)
group by k.id,s.id
on conflict(key_id,scale_type_id) do nothing;

insert into public.scale_degrees(scale_id,degree,semitones,note_pc,degree_label)
select sd.id,u.ord::smallint,u.interval::smallint,((k.tonic_pc+u.interval)%12)::smallint,
       case u.ord when 1 then '1' when 2 then '2' when 3 then '3' when 4 then '4'
       when 5 then '5' when 6 then '6' when 7 then '7' when 8 then '8' else u.ord::text end
from public.scale_definitions sd
join public.music_keys k on k.id=sd.key_id
join public.scale_types s on s.id=sd.scale_type_id
cross join lateral unnest(s.intervals) with ordinality as u(interval,ord)
on conflict(scale_id,degree) do nothing;

create unique index if not exists chord_definitions_key_type_root_uidx
on public.chord_definitions(key_id,chord_type_id,root_pc);

insert into public.chord_definitions(key_id,chord_type_id,root_pc,symbol,notes,generated)
select k.id,c.id,k.tonic_pc,(k.spelling||c.symbol),
       array_agg(((k.tonic_pc+u.interval)%12)::smallint order by u.ord),true
from public.music_keys k cross join public.chord_types c
cross join lateral unnest(c.intervals) with ordinality as u(interval,ord)
group by k.id,c.id,k.tonic_pc,k.spelling,c.symbol
on conflict(key_id,chord_type_id,root_pc) do nothing;

insert into public.chord_tones(chord_id,tone_order,semitones,interval_name,note_pc)
select cd.id,u.ord::smallint,u.interval::smallint,
       case u.interval when 0 then 'root' when 3 then 'minor third' when 4 then 'major third'
       when 5 then 'perfect fourth' when 6 then 'diminished fifth' when 7 then 'perfect fifth'
       when 8 then 'augmented fifth' when 9 then 'major sixth' when 10 then 'minor seventh'
       when 11 then 'major seventh' when 13 then 'flat ninth' when 14 then 'ninth'
       when 15 then 'sharp ninth' when 17 then 'eleventh' when 21 then 'thirteenth'
       else 'extension' end,
       ((cd.root_pc+u.interval)%12)::smallint
from public.chord_definitions cd
join public.chord_types ct on ct.id=cd.chord_type_id
cross join lateral unnest(ct.intervals) with ordinality as u(interval,ord)
on conflict(chord_id,tone_order) do nothing;

insert into public.progression_steps(progression_id,step_index,roman_numeral,function_label,beats,chord_quality,left_hand_formula,right_hand_formula)
select p.id,v.step_index,v.roman,v.function_label,v.beats,v.quality,v.lh,v.rh
from public.progression_templates p
join (values
 ('jazz-251',1,'ii7','predominant',2,'minor7',array[0,7]::smallint[],array[3,7,10]::smallint[]),
 ('jazz-251',2,'V7','dominant',2,'dominant7',array[0,7]::smallint[],array[4,10,14]::smallint[]),
 ('jazz-251',3,'Imaj7','tonic',4,'major7',array[0,7]::smallint[],array[4,7,11]::smallint[]),
 ('jazz-36251',1,'iii7','tonic prolongation',2,'minor7',array[0,7]::smallint[],array[3,7,10]::smallint[]),
 ('jazz-36251',2,'VI7','secondary dominant',2,'dominant7',array[0,7]::smallint[],array[4,10,14]::smallint[]),
 ('jazz-36251',3,'ii7','predominant',2,'minor7',array[0,7]::smallint[],array[3,7,10]::smallint[]),
 ('jazz-36251',4,'V7','dominant',2,'dominant7',array[0,7]::smallint[],array[4,10,14]::smallint[]),
 ('jazz-36251',5,'Imaj7','tonic',4,'major7',array[0,7]::smallint[],array[4,7,11]::smallint[]),
 ('gospel-turnaround',1,'Imaj7','tonic',2,'major7',array[0,7]::smallint[],array[4,7,11]::smallint[]),
 ('gospel-turnaround',2,'vi7','tonic prolongation',2,'minor7',array[0,7]::smallint[],array[3,7,10]::smallint[]),
 ('gospel-turnaround',3,'ii7','predominant',2,'minor7',array[0,7]::smallint[],array[3,7,10]::smallint[]),
 ('gospel-turnaround',4,'V7','dominant',2,'dominant7',array[0,7]::smallint[],array[4,10,14]::smallint[]),
 ('worship-1564',1,'I','tonic',2,'major',array[0,7]::smallint[],array[4,7]::smallint[]),
 ('worship-1564',2,'V','dominant',2,'major',array[0,7]::smallint[],array[4,7]::smallint[]),
 ('worship-1564',3,'vi','relative minor',2,'minor',array[0,7]::smallint[],array[3,7]::smallint[]),
 ('worship-1564',4,'IV','subdominant',2,'major',array[0,7]::smallint[],array[4,7]::smallint[]),
 ('pop-6415',1,'vi','relative minor',2,'minor',array[0,7]::smallint[],array[3,7]::smallint[]),
 ('pop-6415',2,'IV','subdominant',2,'major',array[0,7]::smallint[],array[4,7]::smallint[]),
 ('pop-6415',3,'I','tonic',2,'major',array[0,7]::smallint[],array[4,7]::smallint[]),
 ('pop-6415',4,'V','dominant',2,'major',array[0,7]::smallint[],array[4,7]::smallint[]),
 ('blues-12bar',1,'I7','tonic dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',2,'I7','tonic dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',3,'I7','tonic dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',4,'I7','tonic dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',5,'IV7','subdominant dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',6,'IV7','subdominant dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',7,'I7','tonic dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',8,'I7','tonic dominant',4,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',9,'V7','dominant',2,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',10,'IV7','subdominant dominant',2,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',11,'I7','tonic dominant',2,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[]),
 ('blues-12bar',12,'V7','dominant turnaround',2,'dominant7',array[0,7]::smallint[],array[4,10]::smallint[])
) as v(slug,step_index,roman,function_label,beats,quality,lh,rh) on p.slug=v.slug
on conflict(progression_id,step_index) do nothing;
