import { useMemo, useState } from 'react';
import type { PersonalStudyData, StudyStatus } from '../lib/studyTracker';
import { isDueForReview, setStudyStatus } from '../lib/studyTracker';
type Item={id:string;title:string;category:string};
type Props={items:Item[];value:PersonalStudyData;onChange:(next:PersonalStudyData)=>void;onOpen:(id:string)=>void};
const box:React.CSSProperties={border:'1px solid rgba(255,255,255,.09)',borderRadius:14,background:'#111114',padding:15};
const small:React.CSSProperties={fontSize:11,color:'rgba(245,240,230,.5)'};
const date=(value:string|null)=>value?new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'Not yet';
export default function MyStuff({items,value,onChange,onOpen}:Props){
 const [folderName,setFolderName]=useState('');
 const [activeFolder,setActiveFolder]=useState('all');
 const [notice,setNotice]=useState('');
 const itemMap=useMemo(()=>new Map(items.map(item=>[item.id,item])),[items]);
 const favoriteIds=Object.keys(value.favorites);
 const favorites=items.filter(item=>Object.prototype.hasOwnProperty.call(value.favorites,item.id));
 const visibleFavorites=favorites.filter(item=>activeFolder==='all'||(value.favorites[item.id]??'folder-default')===activeFolder);
 const records=Object.entries(value.progress).map(([id,record])=>({item:itemMap.get(id),id,record})).filter(x=>x.item);
 const mastered=records.filter(x=>x.record.status==='mastered');
 const learning=records.filter(x=>x.record.status==='learning');
 const due=records.filter(x=>isDueForReview(x.record));
 const totalSessions=records.reduce((sum,x)=>sum+x.record.sessions,0);
 const addFolder=()=>{
  const name=folderName.trim();
  if(!name)return;
  if(value.folders.some(f=>f.name.toLowerCase()===name.toLowerCase())){setNotice('A folder with that name already exists.');return;}
  onChange({...value,folders:[...value.folders,{id:'folder-'+Date.now().toString(36),name,createdAt:new Date().toISOString()}]});
  setFolderName('');setNotice('Folder created.');
 };
 const removeFolder=(id:string)=>{
  if(id==='folder-default')return;
  const favoritesNext={...value.favorites};
  Object.keys(favoritesNext).forEach(key=>{if(favoritesNext[key]===id)favoritesNext[key]='folder-default';});
  onChange({...value,folders:value.folders.filter(f=>f.id!==id),favorites:favoritesNext});
 };
 const removeFavorite=(id:string)=>{const next={...value.favorites};delete next[id];onChange({...value,favorites:next});};
 const moveFavorite=(id:string,folderId:string)=>onChange({...value,favorites:{...value.favorites,[id]:folderId}});
 const statusLabel=(status:StudyStatus)=>status==='mastered'?'Mastered':status==='review'?'Needs review':'Learning';
 return <div className="my-stuff">
  <div className="my-stuff-hero"><div><span className="detail-kicker">YOUR PRIVATE PRACTICE SPACE</span><h2>My Stuff</h2><p>Keep your favorite progressions organized and see what you have learned, what needs work and what is ready for review.</p></div><span className="my-stuff-mark">♬</span></div>
  <div className="my-stats">
   <article><strong>{favoriteIds.length}</strong><span>FAVORITES</span></article>
   <article><strong>{mastered.length}</strong><span>MASTERED</span></article>
   <article><strong>{learning.length}</strong><span>IN PROGRESS</span></article>
   <article><strong>{due.length}</strong><span>DUE TO REVIEW</span></article>
   <article><strong>{totalSessions}</strong><span>PRACTICE STARTS</span></article>
  </div>
  <section className="my-stuff-section">
   <div className="my-section-heading"><div><h3>Favorite folders</h3><p>Save progressions and arrange them into your own collections.</p></div></div>
   <div className="folder-create"><input value={folderName} onChange={e=>setFolderName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addFolder();}} placeholder="New folder name…" maxLength={36}/><button onClick={addFolder}>＋ Create folder</button></div>
   {notice&&<p className="my-notice">{notice}</p>}
   <div className="folder-tabs"><button className={activeFolder==='all'?'selected':''} onClick={()=>setActiveFolder('all')}>All favorites <span>{favorites.length}</span></button>{value.folders.map(folder=><div className="folder-tab-wrap" key={folder.id}><button className={activeFolder===folder.id?'selected':''} onClick={()=>setActiveFolder(folder.id)}>▱ {folder.name}<span>{favorites.filter(item=>(value.favorites[item.id]??'folder-default')===folder.id).length}</span></button>{folder.id!=='folder-default'&&<button className="folder-remove" title={'Delete '+folder.name} onClick={()=>removeFolder(folder.id)}>×</button>}</div>)}</div>
   {visibleFavorites.length?<div className="my-item-list">{visibleFavorites.map(item=><article className="my-item" key={item.id}><div className="my-item-main"><span>{item.category}</span><h4>{item.title}</h4><button className="my-open" onClick={()=>onOpen(item.id)}>Open progression →</button></div><div className="my-item-actions"><select aria-label={'Move '+item.title+' to folder'} value={value.favorites[item.id]??'folder-default'} onChange={e=>moveFavorite(item.id,e.target.value)}>{value.folders.map(folder=><option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><button className="my-remove" onClick={()=>removeFavorite(item.id)}>Remove</button></div></article>)}</div>:<div className="my-empty">No favorites in this folder yet. Use the ☆ button on a progression to save it here.</div>}
  </section>
  <section className="my-stuff-section">
   <div className="my-section-heading"><div><h3>Learning progress</h3><p>Your study history, mastery status and spaced-review schedule.</p></div></div>
   {records.length?<div className="my-item-list">{records.sort((a,b)=>(b.record.lastPracticed??'').localeCompare(a.record.lastPracticed??'')).map(({id,item,record})=><article className="my-item progress-item" key={id}><div className="my-item-main"><span>{item!.category} · {record.sessions} practice starts · {record.completedSessions} completed</span><h4>{item!.title}</h4><p>Last practiced: {date(record.lastPracticed)}{record.nextReviewAt?' · Next review: '+date(record.nextReviewAt):''}</p><button className="my-open" onClick={()=>onOpen(id)}>Continue studying →</button></div><div className="my-item-actions"><select className="progress-status-select" aria-label={'Study status for '+item!.title} value={record.status} onChange={e=>onChange(setStudyStatus(value,id,e.target.value as StudyStatus,Math.max(1,record.confidence||3)))}><option value="learning">Learning</option><option value="review">Needs review</option><option value="mastered">Mastered</option></select>{isDueForReview(record)&&<span className="due-pill">Review due</span>}</div></article>)}</div>:<div className="my-empty">Your study record will appear here when you start practicing progressions. Mark a progression as mastered when you can play it confidently without assistance.</div>}
  </section>
  <p className="my-privacy">Your favorites and study history are saved privately in this browser on this device. Clearing browser data or switching devices can remove or leave this data behind; account sync can be added when you enable a sign-in method.</p>
 </div>;
}
