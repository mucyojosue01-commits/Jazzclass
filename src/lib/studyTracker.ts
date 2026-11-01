export type StudyStatus = 'not_started' | 'in_progress' | 'completed' | 'review';
export type StudyRecord = {
 status:StudyStatus; sessions:number; completedSessions:number; lastPracticed:string|null;
 completedAt:string|null; nextReviewAt:string|null; confidence:number;
};
export type FavoriteFolder={id:string;name:string;createdAt:string};
export type PersonalStudyData={version:2;folders:FavoriteFolder[];favorites:Record<string,string[]>;progress:Record<string,StudyRecord>};
const STORAGE_KEY='jazzclass.my-stuff.v2';
const fresh=():PersonalStudyData=>({version:2,folders:[{id:'folder-default',name:'Favorites',createdAt:new Date().toISOString()}],favorites:{},progress:{}});
export function normalizeStudyData(input:unknown):PersonalStudyData {
 const d=(input&&typeof input==='object'?input:{}) as any;
 const folders:Array<FavoriteFolder>=Array.isArray(d.folders)?d.folders.filter((f:any)=>f&&typeof f.id==='string'&&typeof f.name==='string'):[];
 if(!folders.some(f=>f.id==='folder-default'))folders.unshift({id:'folder-default',name:'Favorites',createdAt:new Date().toISOString()});
 const valid=new Set(folders.map(f=>f.id));
 const favorites:Record<string,string[]>={};
 for(const [id,raw] of Object.entries(d.favorites??{})){
  const ids=Array.isArray(raw)?raw:(typeof raw==='string'?[raw]:[]);
  favorites[id]=[...new Set(ids.filter((x):x is string=>typeof x==='string'&&valid.has(x)))];
  if(!favorites[id].length)favorites[id]=['folder-default'];
 }
 const progress:Record<string,StudyRecord>={};
 for(const [id,raw] of Object.entries(d.progress??{})){
  const r=raw as any;const oldStatus=r.status;
  const status:StudyStatus=oldStatus==='mastered'?'completed':oldStatus==='review'?'review':oldStatus==='learning'?'in_progress':['not_started','in_progress','completed','review'].includes(oldStatus)?oldStatus:'in_progress';
  progress[id]={status,sessions:Number(r.sessions)||0,completedSessions:Number(r.completedSessions)||0,lastPracticed:r.lastPracticed??null,completedAt:r.completedAt??r.masteredAt??null,nextReviewAt:r.nextReviewAt??null,confidence:Math.min(5,Math.max(0,Number(r.confidence)||0))};
 }
 return {version:2,folders,favorites,progress};
}
export function loadPersonalStudyData():PersonalStudyData {
 if(typeof window==='undefined')return fresh();
 try{const raw=window.localStorage.getItem(STORAGE_KEY)??window.localStorage.getItem('jazzclass.my-stuff.v1');return raw?normalizeStudyData(JSON.parse(raw)):fresh();}catch{return fresh();}
}
export function savePersonalStudyData(data:PersonalStudyData):void {try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(normalizeStudyData(data)));}catch{/* storage unavailable */}}
export function emptyStudyRecord():StudyRecord{return {status:'not_started',sessions:0,completedSessions:0,lastPracticed:null,completedAt:null,nextReviewAt:null,confidence:0};}
export function recordPractice(data:PersonalStudyData,id:string,completed=false):PersonalStudyData{
 const current=data.progress[id]??emptyStudyRecord();const now=new Date().toISOString();
 return {...data,progress:{...data.progress,[id]:{...current,status:current.status==='completed'?'completed':'in_progress',sessions:current.sessions+(completed?0:1),completedSessions:current.completedSessions+(completed?1:0),lastPracticed:now}}};
}
export function completeStudy(data:PersonalStudyData,id:string,confidence:number):PersonalStudyData{
 const current=data.progress[id]??emptyStudyRecord();const now=new Date();const days=({1:1,2:2,3:4,4:7,5:14} as Record<number,number>)[confidence]??4;
 return {...data,progress:{...data.progress,[id]:{...current,status:'completed',confidence,completedAt:now.toISOString(),nextReviewAt:new Date(now.getTime()+days*86400000).toISOString()}}};
}
export function markForReview(data:PersonalStudyData,id:string):PersonalStudyData{
 const current=data.progress[id]??emptyStudyRecord();return {...data,progress:{...data.progress,[id]:{...current,status:'review',nextReviewAt:new Date().toISOString()}}};
}
export function isDueForReview(r:StudyRecord|undefined):boolean{return Boolean(r?.nextReviewAt&&new Date(r.nextReviewAt).getTime()<=Date.now());}
