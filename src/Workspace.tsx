import {useEffect,useRef,useState} from 'react';
import type {UserProfile} from './auth';
import {signOut} from './auth';
import {articles} from './feed';
import type {Article} from './feed';
import {request} from './workspace-api';
import type {Book,MindMap} from './workspace-api';
import {Glyph,Logo,Empty,FeedCard,ArticleDialog} from './WorkspaceUI';
import type {IconName} from './WorkspaceUI';
import {Books,Reader} from './Books';
import {JobsTile} from './JobsTile';
import {Interview} from './Interview';
import {Mindmaps,MapEditor} from './Mindmaps';
import './workspace.css';

export default function Workspace({user,route}:{user:UserProfile;route:string}){
 const parts=route.replace('#/workspace','').split('/').filter(Boolean);const section=parts[0]||'feed';
 const searchInput=useRef<HTMLInputElement>(null);

 const [sidebarExpanded,setSidebarExpanded]=useState(()=>{try{return localStorage.getItem('kb-sidebar-expanded')==='true';}catch{return false;}});
 useEffect(()=>{try{localStorage.setItem('kb-sidebar-expanded',String(sidebarExpanded));}catch{/* Preferences are optional when storage is unavailable. */}},[sidebarExpanded]);
 const [editingDirty,setEditingDirty]=useState(false);
 const [pendingRoute,setPendingRoute]=useState('');
 function navigate(destination:string){if(editingDirty)setPendingRoute(destination);else window.location.hash=destination;}
 useEffect(()=>{
  function focusSearch(event:KeyboardEvent){
   const target=event.target;
   if(event.key==='/'&&!(target instanceof HTMLElement&&target.closest('input,textarea,[contenteditable]'))){
    event.preventDefault();searchInput.current?.focus();
   }
  }
  window.addEventListener('keydown',focusSearch);
  return()=>window.removeEventListener('keydown',focusSearch);
 },[]);
 useEffect(()=>{if(pendingRoute&&!editingDirty){window.location.hash=pendingRoute;setPendingRoute('');}},[pendingRoute,editingDirty]);
 const [books,setBooks]=useState<Book[]>([]);const [maps,setMaps]=useState<MindMap[]>([]);const [saved,setSaved]=useState<string[]>([]);
 const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [query,setQuery]=useState('');const [topic,setTopic]=useState('All topics');
 const [opened,setOpened]=useState<Article|null>(null);const [loggingOut,setLoggingOut]=useState(false);const [savingPost,setSavingPost]=useState(false);
 useEffect(()=>{let active=true;Promise.all([request<Book[]>('/api/books'),request<MindMap[]>('/api/mindmaps'),request<string[]>('/api/saved-posts')])
  .then(([library,mindmaps,bookmarks])=>{if(active){setBooks(library);setMaps(mindmaps);setSaved(bookmarks);}})
  .catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[user.id]);
 useEffect(()=>{setQuery('');},[section]);
 async function logout(){setLoggingOut(true);try{await signOut();}catch{setError('Unable to sign out. Please try again.');setLoggingOut(false);}}
 async function toggleSave(id:string){
  if(savingPost)return;setSavingPost(true);setError('');
  try{const exists=saved.includes(id);await request('/api/saved-posts/'+id,exists?'DELETE':'PUT');setSaved(exists?saved.filter(item=>item!==id):[...saved,id]);}
  catch(e){setError(e instanceof Error?e.message:'Could not update bookmark.');}finally{setSavingPost(false);}
 }
 function updateMap(map:MindMap){setMaps(current=>[map,...current.filter(m=>m.id!==map.id)]);}
 function onProgress(id:string,chapter:number,completed:boolean){setBooks(current=>current.map(book=>book.id===id?{...book,currentChapter:chapter,completed}:book));}
 const activeBook=books.find(b=>b.id===parts[1]);const activeMap=maps.find(m=>m.id===parts[1]);
 const filtered=articles.filter(article=>(section!=='saved'||saved.includes(article.id))&&(topic==='All topics'||article.topic===topic)&&(article.title+' '+article.tags.join(' ')).toLowerCase().includes(query.toLowerCase()));
 const navigation:{id:string;label:string;icon:IconName;count?:number}[]=[{id:'feed',label:'My feed',icon:'feed'},{id:'saved',label:'Saved for later',icon:'saved',count:saved.length},{id:'books',label:'Books',icon:'books',count:books.length},{id:'mindmaps',label:'Mindmaps',icon:'map',count:maps.length},{id:'interview',label:'Interview',icon:'briefcase'}];
 return <div className={'kb-app '+(sidebarExpanded?'sidebar-expanded':'sidebar-collapsed')+(parts[1]?' kb-detail-view':'')} onClickCapture={event=>{
 if(!editingDirty)return;
 const link=event.target instanceof Element?event.target.closest('a'):null;
 const destination=link?.getAttribute('href');
 if(destination?.startsWith('#/')&&destination!==window.location.hash){event.preventDefault();setPendingRoute(destination);}
}}><a className="kb-skip" href="#workspace-main">Skip to content</a><header className="kb-topbar"><div className="kb-topbar-brand"><Logo/></div><label className="kb-search"><Glyph name="search" size={19}/><input ref={searchInput} onKeyDown={event=>{if(event.key==='Enter'&&parts[1])navigate('#/workspace/'+section);}} aria-label="Search your knowledge" placeholder={section==='books'?'Search books and authors…':section==='mindmaps'?'Search your mindmaps…':section==='interview'?'Search interview questions…':'Search your knowledge…'} value={query} onChange={e=>setQuery(e.target.value)}/><span>/</span></label><div className="kb-topbar-user"><span className="kb-curious-label"><Glyph name="spark" size={17}/> Stay curious</span><button className="kb-icon-button" onClick={logout} disabled={loggingOut} aria-label="Sign out"><Glyph name="logout"/></button><span className="kb-avatar" title={user.displayName}>{user.displayName.split(' ').map(s=>s[0]).slice(0,2).join('')}</span></div></header><nav className="kb-workspace-nav" aria-label="Workspace navigation">{navigation.map(item=><a href={'#/workspace'+(item.id==='feed'?'':'/'+item.id)} className={section===item.id?'active':''} aria-current={section===item.id?'page':undefined} key={item.id}><Glyph name={item.icon} size={18}/><span>{item.label}</span>{item.count!==undefined&&<b>{item.count}</b>}</a>)}</nav>
<aside className="kb-sidebar kb-feature-sidebar" aria-label="Upcoming features">
<div className="kb-sidebar-heading"><span className="kb-overline">COMING SOON</span><button className="kb-icon-button kb-sidebar-toggle" type="button" onClick={()=>setSidebarExpanded(!sidebarExpanded)} aria-label={sidebarExpanded?'Collapse sidebar':'Expand sidebar'} title={sidebarExpanded?'Collapse sidebar':'Expand sidebar'} aria-expanded={sidebarExpanded} aria-controls="kb-feature-list"><Glyph name="chevron" size={17}/></button></div>
<div className="kb-feature-list" id="kb-feature-list">{([{label:'Notes',icon:'note'},{label:'AI agents',icon:'spark'},{label:'GraphRAG',icon:'map'},{label:'Study plans',icon:'books'}] as {label:string;icon:IconName}[]).map(feature=><div key={feature.label} className="kb-feature-placeholder" tabIndex={0} aria-label={feature.label+' — coming soon'} title={feature.label+' — coming soon'}><Glyph name={feature.icon} size={19}/><span>{feature.label}<small>Coming soon</small></span></div>)}</div>
<a className="kb-sidebar-project" href="https://github.com/swapnilgaware/knowledge-base-application" target="_blank" rel="noopener noreferrer" aria-label="Follow the project on GitHub" title="Follow the project on GitHub"><Glyph name="spark" size={18}/><span>Follow the project ↗</span></a></aside><main className={'kb-main '+(parts[1]?'kb-main-wide':'')} id="workspace-main">{pendingRoute&&<div className="kb-alert kb-unsaved" role="alert"><span>Your mindmap has unsaved changes. Save it to continue, or discard your edits.</span><div><button className="kb-button secondary" onClick={()=>setPendingRoute('')}>Keep editing</button><button className="kb-button" onClick={()=>{setEditingDirty(false);window.location.hash=pendingRoute;setPendingRoute('');}}>Discard and continue</button></div></div>}{error&&<p className="kb-alert" role="alert">{error} <a href="#/login">Sign in</a></p>}{loading?<div className="kb-empty" role="status">Opening your knowledge space…</div>:section==='books'?activeBook?<Reader key={activeBook.id} book={activeBook} number={Number(parts[2]||activeBook.currentChapter)} onProgress={onProgress}/>:parts[1]?<Empty title="Book not found">Return to <a href="#/workspace/books">your bookshelf</a>.</Empty>:<Books books={books} query={query}/>:section==='mindmaps'?activeMap?<MapEditor key={activeMap.id} map={activeMap} onSaved={updateMap} onDirtyChange={setEditingDirty}/>:parts[1]?<Empty title="Mindmap not found">This map isn't in your workspace. <a href="#/workspace/mindmaps">View your mindmaps.</a></Empty>:<Mindmaps maps={maps} query={query} onCreated={updateMap}/>:section==='interview'?<Interview query={query}/>:<><div className="kb-page-heading"><div><span className="kb-overline">HELLO, {user.displayName.split(' ')[0].toUpperCase()} <span className="tiny-purple-dot"/></span><h1>{section==='saved'?'Saved for later':'Your daily dose of curiosity'}<span>.</span></h1><p>{section==='saved'?'Good ideas deserve a second look.':'A few good reads. A few new connections. All in your space.'}</p></div><span className="kb-starter-badge"><span/> Starter collection</span></div><div className="kb-feed-controls"><div>{['All topics','AI','Learning','Systems','Backend'].map(item=><button onClick={()=>setTopic(item)} className={topic===item?'selected':''} key={item} aria-pressed={topic===item}>{item}</button>)}</div><span>{filtered.length} reads</span></div><div className="kb-feed-grid">{filtered.map(article=><FeedCard article={article} key={article.id} saved={saved.includes(article.id)} onSave={()=>void toggleSave(article.id)} onOpen={()=>setOpened(article)}/>)}</div>{!filtered.length&&<Empty title={section==='saved'&&!saved.length?'Your next good read goes here.':'No reads found.'}>{section==='saved'&&!saved.length?'Tap the bookmark on a feed card to save it for later.':'Try another topic or search.'}</Empty>}<p className="kb-feed-footnote">Original starter guides to explore your workspace. Automated blog discovery and AI summaries are coming later.</p></>}</main>{!parts[1]&&<aside className="kb-rightbar kb-original-cards" aria-label="Learning overview"><div className="kb-space-card"><div className="space-card-title"><Glyph name="spark" size={18}/><h2>Your learning space</h2></div><div className="kb-space-stats"><a href="#/workspace/books"><strong>{books.filter(b=>b.completed).length}</strong><span>Books read</span></a><a href="#/workspace/mindmaps"><strong>{maps.length}</strong><span>Mindmaps</span></a><a href="#/workspace/saved"><strong>{saved.length}</strong><span>Saved reads</span></a></div><p>A little progress, every day.</p></div><JobsTile/></aside>}{opened&&<ArticleDialog article={opened} onClose={()=>setOpened(null)}/>}</div>;
}
