export type StudyStatus = 'learning'|'review'|'mastered';
export type StudyRecord = { status:StudyStatus; sessions:number; completedSessions:number; lastPracticed:string|null; masteredAt:string|null; nextReviewAt:string|null; confidence:number };
export type FavoriteFolder = { id:string; name:string; createdAt:string };
export type PersonalStudyData = { version:1; folders:FavoriteFolder[]; favorites:Record<string,string|null>; progress:Record<string,StudyRecord> };
const STORAGE_KEY='jazzclass.my-stuff.v1';
const fresh=():PersonalStudyData=>({version:1,folders:[{id:'folder-default',name:'Favorites',createdAt:new Date().toISOString()}],favorites:{},progress:{}});
export function loadPersonalStudyData():PersonalStudyData {
  if(typeof window==='undefined')return fresh();
  try {
    const raw=window.localStorage.getItem(STORAGE_KEY);
    if(!raw)return fresh();
    const parsed=JSON.parse(raw) as Partial<PersonalStudyData>;
    if(parsed.version!==1 || !Array.isArray(parsed.folders))return fresh();
    return {version:1,folders:parsed.folders,favorites:parsed.favorites??{},progress:parsed.progress??{}};
  } catch { return fresh(); }
}
export function savePersonalStudyData(data:PersonalStudyData):void {
  try { window.localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); } catch { /* private browsing / storage quota */ }
}
export function emptyStudyRecord():StudyRecord {
  return {status:'learning',sessions:0,completedSessions:0,lastPracticed:null,masteredAt:null,nextReviewAt:null,confidence:0};
}
export function recordPractice(data:PersonalStudyData,id:string,completed=false):PersonalStudyData {
  const current=data.progress[id]??emptyStudyRecord();
  const now=new Date().toISOString();
  return {...data,progress:{...data.progress,[id]:{...current,status:current.status==='mastered'?'mastered':'learning',sessions:current.sessions+(completed?0:1),completedSessions:current.completedSessions+(completed?1:0),lastPracticed:now}}};
}
export function setStudyStatus(data:PersonalStudyData,id:string,status:StudyStatus,confidence:number):PersonalStudyData {
  const current=data.progress[id]??emptyStudyRecord();
  const now=new Date();
  const intervals:Record<number,number>={1:1,2:2,3:4,4:7,5:14};
  const next=new Date(now.getTime()+intervals[confidence]*86400000);
  return {...data,progress:{...data.progress,[id]:{...current,status,confidence,masteredAt:status==='mastered'?(current.masteredAt??now.toISOString()):null,nextReviewAt:status==='mastered'?next.toISOString():null}}};
}
export function isDueForReview(record:StudyRecord|undefined):boolean {
  return Boolean(record?.nextReviewAt && new Date(record.nextReviewAt).getTime()<=Date.now());
}
