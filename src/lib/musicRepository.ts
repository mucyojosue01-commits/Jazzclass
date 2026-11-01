import { isSupabaseConfigured, supabase } from './supabaseClient';

export type CatalogCounts = { scales:number; chords:number; progressions:number; lessons:number; sources:number };
export async function getCatalogCounts():Promise<CatalogCounts|null>{
  if(!supabase || !isSupabaseConfigured)return null;
  const tables=['scale_types','chord_types','progression_templates','lessons','sources'] as const;
  const counts=await Promise.all(tables.map(async table=>{
    const {count,error}=await supabase!.from(table).select('id',{count:'exact',head:true});
    if(error)throw error;
    return count??0;
  }));
  return {scales:counts[0],chords:counts[1],progressions:counts[2],lessons:counts[3],sources:counts[4]};
}
export async function searchPublishedLessons(query=''){
  if(!supabase)return {data:[],error:null,offline:true};
  let request=supabase.from('lessons').select('id,slug,title,category,level,summary,estimated_minutes').eq('published',true).order('sort_order');
  if(query.trim())request=request.ilike('title',`%${query.trim()}%`);
  const {data,error}=await request;
  return {data:data??[],error,offline:false};
}


export type ProgressionStepRecord = {
  progression_id:string; step_index:number; roman_numeral:string; function_label:string;
  beats:number; chord_quality:string; left_hand_formula:number[]; right_hand_formula:number[];
};
export type ProgressionRecord = {
  id:string; slug:string; title:string; style:string; roman_numerals:string[];
  description:string; difficulty:number; tempo_min:number; tempo_max:number;
  source_quality:string; steps:ProgressionStepRecord[];
};
export async function loadProgressionCatalogue():Promise<{data:ProgressionRecord[];error:string|null}>{
  if(!supabase || !isSupabaseConfigured)return {data:[],error:'Supabase is not configured.'};
  const [templates,steps]=await Promise.all([
    supabase.from('progression_templates').select('id,slug,title,style,roman_numerals,description,difficulty,tempo_min,tempo_max,source_quality').order('style').order('title'),
    supabase.from('progression_steps').select('progression_id,step_index,roman_numeral,function_label,beats,chord_quality,left_hand_formula,right_hand_formula').order('step_index')
  ]);
  if(templates.error)return {data:[],error:templates.error.message};
  if(steps.error)return {data:[],error:steps.error.message};
  const grouped=new Map<string,ProgressionStepRecord[]>();
  for(const step of (steps.data??[]) as ProgressionStepRecord[]){
    const list=grouped.get(step.progression_id)??[];list.push(step);grouped.set(step.progression_id,list);
  }
  return {data:((templates.data??[]) as Omit<ProgressionRecord,'steps'>[]).map(item=>({...item,steps:grouped.get(item.id)??[]})),error:null};
}
