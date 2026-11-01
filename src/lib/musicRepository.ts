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
