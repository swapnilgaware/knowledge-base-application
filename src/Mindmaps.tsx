import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import {Glyph,Empty} from './WorkspaceUI';
import {request} from './workspace-api';
import type {MapNode,MindMap} from './workspace-api';

export function GraphCanvas({nodes,selected,onSelect,compact=false}:{nodes:MapNode[];selected?:string;onSelect?:(id:string)=>void;compact?:boolean}){
 const root=nodes.find(n=>n.parentId===null);if(!root)return null;
 let leaf=0;const positions=new Map<string,{x:number;y:number;depth:number}>();
 function place(node:MapNode,depth:number):number{
  const ys=nodes.filter(n=>n.parentId===node.id).map(child=>place(child,depth+1));
  const y=ys.length?ys.reduce((a,b)=>a+b,0)/ys.length:65+(leaf++)*85;
  positions.set(node.id,{x:130+depth*235,y,depth});return y;
 }
 place(root,0);
 const width=Math.max(650,...[...positions.values()].map(p=>p.x+125));const height=Math.max(260,leaf*85+55);
 return <svg className={compact?'kb-mini-graph':'kb-graph'} viewBox={'0 0 '+width+' '+height} style={compact?undefined:{width,height}} aria-label="Connected ideas">{nodes.filter(n=>n.parentId!==null).map(n=>{const from=positions.get(n.parentId!)!;const to=positions.get(n.id)!;return <path key={'edge'+n.id} d={'M '+(from.x+85)+' '+from.y+' C '+(from.x+130)+' '+from.y+', '+(to.x-130)+' '+to.y+', '+(to.x-85)+' '+to.y} fill="none" stroke={to.depth===1?'#8877b4':'#455568'} strokeWidth={compact?2:1.8}/>;})}{nodes.map(node=>{const p=positions.get(node.id)!;return <g key={node.id} role={onSelect?'button':undefined} tabIndex={onSelect?0:undefined} aria-label={onSelect?'Select idea: '+node.label:undefined} onClick={()=>onSelect?.(node.id)} onKeyDown={e=>{if(onSelect&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect(node.id);}}} className={onSelect?'graph-interactive':''}><title>{node.label}</title><rect x={p.x-85} y={p.y-24} width={170} height={48} rx={10} fill={p.depth===0?'#b59bef':p.depth%2?'#252a3e':'#1d3437'} stroke={selected===node.id?'#f0dcff':p.depth===0?'#b59bef':'#485068'} strokeWidth={selected===node.id?2.5:1}/><text x={p.x} y={p.y+5} textAnchor="middle" fill={p.depth===0?'#231432':'#deddeb'} fontSize={13} fontWeight={p.depth===0?700:500}>{node.label.length>23?node.label.slice(0,22)+'…':node.label}</text></g>;})}</svg>;
}
export function MapEditor({map,onSaved,onDirtyChange}:{map:MindMap;onSaved:(map:MindMap)=>void;onDirtyChange:(dirty:boolean)=>void}){
 const [title,setTitle]=useState(map.title);const [nodes,setNodes]=useState(map.nodes);const [selected,setSelected]=useState(map.nodes[0].id);
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [zoom,setZoom]=useState(1);
 const dirty=title!==map.title||JSON.stringify(nodes)!==JSON.stringify(map.nodes);
 useEffect(()=>{onDirtyChange(dirty);return()=>onDirtyChange(false);},[dirty,onDirtyChange]);
 const idea=nodes.find(n=>n.id===selected)||nodes[0];
 useEffect(()=>{function warn(event:BeforeUnloadEvent){if(dirty){event.preventDefault();event.returnValue='';}}window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 async function save(){
  setBusy(true);setMessage('');
  try{const updated=await request<MindMap>('/api/mindmaps/'+map.id,'PUT',{title,nodes,version:map.version});onSaved(updated);setMessage('All changes saved.');}
  catch(e){setMessage(e instanceof Error?e.message:'Unable to save.');}finally{setBusy(false);}
 }
 function branch(){const node={id:crypto.randomUUID(),parentId:idea.id,label:'New idea'};setNodes([...nodes,node]);setSelected(node.id);setMessage('');}
 function remove(){
  const ids=new Set([idea.id]);let changed=true;
  while(changed){changed=false;nodes.forEach(n=>{if(n.parentId&&ids.has(n.parentId)&&!ids.has(n.id)){ids.add(n.id);changed=true;}});}
  setNodes(nodes.filter(n=>!ids.has(n.id)));setSelected(nodes.find(n=>n.parentId===null)!.id);
 }
 return <><div className="kb-map-heading"><a href="#/workspace/mindmaps">← All mindmaps</a><div className="kb-map-save"><span role="status">{dirty?'Unsaved changes':'Saved to your space'}</span><button className="kb-button" onClick={save} disabled={busy||!dirty}>{busy?'Saving…':'Save changes'} <Glyph name="check" size={17}/></button></div></div><label className="kb-overline" htmlFor="map-title">MINDMAP TITLE</label><input className="kb-map-title" id="map-title" value={title} maxLength={120} onChange={e=>setTitle(e.target.value)}/><p className="kb-muted">Select an idea to edit it or grow a new branch.</p><div className="kb-map-editor"><div className="kb-map-canvas"><div className="kb-zoom"><button className="kb-icon-button" onClick={()=>setZoom(Math.max(.6,zoom-.1))} aria-label="Zoom out mindmap"><Glyph name="minus" size={16}/></button><span>{Math.round(zoom*100)}%</span><button className="kb-icon-button" onClick={()=>setZoom(Math.min(1.5,zoom+.1))} aria-label="Zoom in mindmap"><Glyph name="plus" size={16}/></button></div><div className="kb-graph-scroll"><div style={{zoom}}><GraphCanvas nodes={nodes} selected={idea.id} onSelect={setSelected}/></div></div></div><aside className="kb-idea-editor"><span className="kb-overline">{idea.parentId===null?'CENTRAL IDEA':'SELECTED IDEA'}</span><label htmlFor="idea-label">Give it a name</label><textarea id="idea-label" value={idea.label} maxLength={120} rows={4} onChange={e=>setNodes(nodes.map(n=>n.id===idea.id?{...n,label:e.target.value}:n))}/><button className="kb-button secondary" onClick={branch} disabled={nodes.length>=60}><Glyph name="plus" size={17}/> Add branch</button>{idea.parentId!==null&&<button className="kb-delete-idea" onClick={remove}>Remove this branch</button>}<div className="kb-idea-tip"><Glyph name="spark" size={19}/><p>A good connection starts with a question. What does this idea remind you of?</p></div><span className="kb-muted">{nodes.length} / 60 ideas</span></aside></div>{message&&<p className={message==='All changes saved.'?'kb-success':'kb-alert'} role="status">{message}</p>}</>;
}
export function Mindmaps({maps,query,onCreated}:{maps:MindMap[];query:string;onCreated:(map:MindMap)=>void}){
 const [creating,setCreating]=useState(false);const [title,setTitle]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function create(event:FormEvent){
  event.preventDefault();setBusy(true);setError('');
  const nodes:MapNode[]=[{id:'root',parentId:null,label:title.trim()},...['Sources','Key ideas','Questions','Connections'].map((label,i)=>({id:'branch-'+i,parentId:'root',label}))];
  try{const map=await request<MindMap>('/api/mindmaps','POST',{title:title.trim(),nodes,version:0});onCreated(map);window.location.hash='#/workspace/mindmaps/'+map.id;}
  catch(e){setError(e instanceof Error?e.message:'Could not create mindmap.');}finally{setBusy(false);}
 }
 const filtered=maps.filter(m=>m.title.toLowerCase().includes(query.toLowerCase()));
 const preview=[{id:'root',parentId:null,label:'Your next big idea'},...['What I know','What I wonder','Where it connects'].map((label,i)=>({id:''+i,parentId:'root',label}))];
 return <><div className="kb-page-heading"><div><span className="kb-overline">THINK IN CONNECTIONS</span><h1>Your mindmaps<span>.</span></h1><p>Give your ideas room to branch out.</p></div><button className="kb-button" onClick={()=>setCreating(!creating)}><Glyph name="plus" size={17}/> New mindmap</button></div>{creating&&<form className="kb-new-map" onSubmit={create}><label htmlFor="new-map-title">What are you exploring?</label><div><input id="new-map-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. How GraphRAG works" required maxLength={120} autoFocus/><button className="kb-button" disabled={busy}>{busy?'Creating…':'Create mindmap'}<Glyph name="arrow" size={17}/></button></div><p>Start with a central idea and four editable branches.</p></form>}{error&&<p className="kb-alert" role="alert">{error}</p>}{!maps.length?<div className="kb-map-intro"><div><span className="kb-overline">START WITH ONE IDEA</span><h2>Make the connections<br/>visible.</h2><p>Link what you read to what you already know. Turn a topic, a book, or a question into a map you can keep growing.</p><button className="kb-button secondary" onClick={()=>setCreating(true)}>Create your first mindmap <Glyph name="plus" size={17}/></button></div><GraphCanvas nodes={preview} compact/></div>:<div className="kb-maps-grid">{filtered.map(map=><a className="kb-map-card" href={'#/workspace/mindmaps/'+map.id} key={map.id}><div><Glyph name="map" size={18}/><span>{map.nodes.length} ideas</span><Glyph name="chevron" size={18}/></div><GraphCanvas nodes={map.nodes} compact/><h2>{map.title}</h2><p>Updated {new Date(map.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</p></a>)}</div>}{maps.length>0&&!filtered.length&&<Empty title="No mindmaps found">Try a different search.</Empty>}</>;
}
