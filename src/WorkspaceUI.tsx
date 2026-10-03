import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';
import type {Article} from './feed';
export type IconName='feed'|'saved'|'books'|'map'|'note'|'search'|'arrow'|'plus'|'close'|'logout'|'menu'|'check'|'clock'|'spark'|'chevron'|'minus'|'briefcase';
export function Glyph({name,size=20}:{name:IconName;size?:number}){
 const paths:Record<IconName,ReactNode>={
 briefcase:<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/></>,
 feed:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
 saved:<path d="M6 3h12v18l-6-4-6 4V3Z"/>,
 books:<><path d="M12 5C8 2 4 3 3 4v15c3-1 6-1 9 1m0-15c4-3 8-2 9-1v15c-3-1-6-1-9 1V5Z"/><path d="M6 8h3m6 0h3"/></>,
 map:<><path d="M6 12h5m0 0V5h7m-7 7v7h7"/><rect x="2" y="9" width="5" height="6" rx="1"/><rect x="17" y="2" width="5" height="6" rx="1"/><rect x="17" y="16" width="5" height="6" rx="1"/></>,
 search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
 note:<><path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8M8 16h5"/></>,
 arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,plus:<path d="M12 5v14M5 12h14"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,
 logout:<path d="M10 4H4v16h6m4-13 5 5-5 5m-5-5h10"/>,menu:<path d="M3 6h18M3 12h18M3 18h18"/>,
 check:<path d="m5 12 4 4L19 6"/>,clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 spark:<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>,
 chevron:<path d="m9 5 7 7-7 7"/>,minus:<path d="M5 12h14"/>
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function Logo(){return <a href="#/workspace" className="kb-logo" aria-label="Knowledge Base feed"><span className="kb-logo-mark"><Glyph name="map" size={23}/></span><span>knowledge<span>base</span><b>.</b></span></a>;}
export function Empty({title,children}:{title:string;children:ReactNode}){return <div className="kb-empty"><Glyph name="spark" size={32}/><h2>{title}</h2><p>{children}</p></div>;}
function CardArt({kind}:{kind:string}){
 return <div className={'kb-card-art art-'+kind} aria-hidden="true"><div className="art-grid"/>{kind==='graph'?<svg viewBox="0 0 300 150"><path d="M70 40 140 75l85-40M140 75l65 60M140 75 45 120" stroke="#be9bff" fill="none"/>{[[70,40],[140,75],[225,35],[205,135],[45,120]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={i===1?22:12} fill={i===1?'#b99cf9':'#59427d'}/><circle cx={x} cy={y} r={i===1?31:19} fill="none" stroke="#9473c1"/></g>)}</svg>:kind==='recall'?<><span className="art-huge">a → <i>aha.</i></span><span className="art-caption">READ. RECALL. CONNECT.</span></>:kind==='agents'?<div className="agent-chain"><span>discover</span><b>→</b><span>understand</span><b>→</b><span>verify</span></div>:kind==='systems'?<div className="system-orbit"><span/><span/><span/><b>↻</b></div>:kind==='notes'?<div className="art-notepad"><span>an idea worth keeping</span><i/><i/><i/><b>✳</b></div>:<div className="art-code"><span><i>@Entity</i></span><span>class <b>MyKnowledge</b> {'{'}</span><span>&nbsp; ideas.connect();</span><span>{'}'}</span></div>}</div>;
}
export function FeedCard({article,saved,onSave,onOpen}:{article:Article;saved:boolean;onSave:()=>void;onOpen:()=>void}){
 return <article className="kb-feed-card"><div className="kb-card-source"><span className="source-mark">k.</span><span>Knowledge Base</span><span className="source-label">STARTER GUIDE</span></div><button className="kb-card-open" onClick={onOpen}><h2>{article.title}</h2><CardArt kind={article.art}/></button><div className="kb-card-body"><p>{article.summary}</p><div className="kb-tags">{article.tags.map(tag=><span key={tag}>#{tag}</span>)}</div></div><footer><span><Glyph name="clock" size={14}/>{article.minutes} min read</span><button className={saved?'is-saved':''} onClick={onSave} aria-label={(saved?'Unsave ':'Save ')+article.title} aria-pressed={saved}><Glyph name="saved" size={18}/></button></footer></article>;
}
export function ArticleDialog({article,onClose}:{article:Article;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{ref.current?.showModal();},[]);
 return <dialog className="kb-article-dialog" ref={ref} onCancel={onClose}><button className="kb-dialog-close kb-icon-button" onClick={onClose} aria-label="Close article" autoFocus><Glyph name="close"/></button><span className="kb-overline">KNOWLEDGE BASE · STARTER GUIDE</span><h1>{article.title}</h1><div className="kb-tags">{article.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>{article.body.map((p,i)=><p key={i}>{p}</p>)}<button className="kb-button" onClick={()=>{onClose();window.location.hash='#/workspace/mindmaps';}}>Connect an idea <Glyph name="map" size={17}/></button></dialog>;
}
