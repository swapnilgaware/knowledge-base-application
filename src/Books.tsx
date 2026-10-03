import {useEffect,useState} from 'react';
import {Glyph,Empty} from './WorkspaceUI';
import {request} from './workspace-api';
import type {Book,Chapter,ChapterHeading} from './workspace-api';

export function BookCover({book}:{book:Book}){
 return <div className={'kb-book-cover cover-'+book.color} aria-hidden="true"><span>{book.author}</span><strong>{book.title}</strong><div className="cover-design"><i/><i/><i/><b>{book.id==='sherlock'?'⌕':book.id==='looking-glass'?'♜':'✳'}</b></div><small>THE READING COLLECTION</small></div>;
}
export function Books({books,query}:{books:Book[];query:string}){
 const filtered=books.filter(b=>(b.title+' '+b.author+' '+b.category).toLowerCase().includes(query.toLowerCase()));
 return <><div className="kb-page-heading"><div><span className="kb-overline">A LITTLE READING. A BIGGER WORLD.</span><h1>Your bookshelf<span>.</span></h1><p>Stay a while. Every book opens right here.</p></div><span className="kb-count">{books.length} books</span></div><div className="kb-reading-banner"><div><Glyph name="books" size={26}/><h2>One chapter at a time.</h2><p>Read in your browser. Pick up where you left off, on any device.</p></div><span>PUBLIC-DOMAIN COLLECTION</span></div><div className="kb-book-grid">{filtered.map(book=>{const percent=book.completed?100:Math.round(book.currentChapter/book.chapterCount*100);return <article className="kb-book-card" key={book.id}><a href={'#/workspace/books/'+book.id+'/'+book.currentChapter} aria-label={'Read '+book.title}><BookCover book={book}/></a><div className="kb-book-info"><span className="kb-category">{book.category} · {book.chapterCount} chapters</span><h2>{book.title}</h2><p>{book.author}</p><div className="kb-progress-track"><span style={{width:percent+'%'}}/></div><div className="kb-book-bottom"><span>{book.completed?'Finished':percent?percent+'% · Chapter '+(book.currentChapter+1):'Ready when you are'}</span><a href={'#/workspace/books/'+book.id+'/'+book.currentChapter}>{percent?'Continue':'Read now'} <Glyph name="arrow" size={16}/></a></div></div></article>;})}</div>{!filtered.length&&<Empty title="No books found">Try searching for a title, author, or category.</Empty>}</>;
}
export function Reader({book,number,onProgress}:{book:Book;number:number;onProgress:(id:string,chapter:number,completed:boolean)=>void}){
 const [chapter,setChapter]=useState<Chapter|null>(null);const [contents,setContents]=useState<ChapterHeading[]>([]);
 const [error,setError]=useState('');const [font,setFont]=useState(19);const [night,setNight]=useState(false);
 useEffect(()=>{
  let active=true;setChapter(null);setError('');
  Promise.all([request<Chapter>('/api/books/'+book.id+'/chapters/'+number),request<ChapterHeading[]>('/api/books/'+book.id+'/contents')])
   .then(async([part,toc])=>{
    if(!active)return;setChapter(part);setContents(toc);
    if(number<book.chapterCount&&!book.completed){
     await request('/api/books/'+book.id+'/progress','PUT',{chapterNumber:number,completed:false});
     if(active)onProgress(book.id,number,false);
    }
   }).catch(e=>{if(active)setError(e.message);});
  return()=>{active=false;};
 },[book.id,number]);
 async function finish(){
  try{await request('/api/books/'+book.id+'/progress','PUT',{chapterNumber:book.chapterCount-1,completed:true});onProgress(book.id,book.chapterCount-1,true);window.location.hash='#/workspace/books';}
  catch(e){setError(e instanceof Error?e.message:'Could not save reading position.');}
 }
 function heading(title:string){return title.replace(/^CHAPTER [IVX]+\. /,'').replace(/^[IVX]+\. /,'');}
 return <div className="kb-reader"><div className="kb-reader-toolbar"><a href="#/workspace/books">← Bookshelf</a><span>{book.title}</span><div><button className="kb-icon-button" onClick={()=>setFont(Math.max(16,font-1))} disabled={font===16} aria-label="Decrease reader font size">A−</button><button className="kb-icon-button" onClick={()=>setFont(Math.min(26,font+1))} disabled={font===26} aria-label="Increase reader font size">A+</button><button className="kb-icon-button" onClick={()=>setNight(!night)} aria-pressed={night} aria-label="Night reading">{night?'☀':'☾'}</button></div></div>{error&&<p className="kb-alert" role="alert">{error}</p>}<div className="kb-reader-layout"><nav className="kb-contents" aria-label="Book chapters"><span className="kb-overline">CONTENTS</span>{contents.map(item=><a href={'#/workspace/books/'+book.id+'/'+item.chapterNumber} key={item.chapterNumber} aria-current={item.chapterNumber===number?'page':undefined}>{item.chapterNumber<book.chapterCount&&<span>{String(item.chapterNumber+1).padStart(2,'0')}</span>}{heading(item.title)}</a>)}</nav><article className={'kb-reading-paper '+(night?'paper-night':'')} style={{fontSize:font}}>{chapter?<><span className="kb-overline">{number<book.chapterCount?'CHAPTER '+(number+1)+' OF '+book.chapterCount:'EDITION INFORMATION'}</span><h1>{heading(chapter.title)}</h1><p className="reader-byline">{book.author}</p>{chapter.content.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p className="reader-paragraph" key={i}>{p.replace(/\n/g,' ')}</p>)}<div className="kb-reader-bottom">{number>0?<a className="kb-button secondary" href={'#/workspace/books/'+book.id+'/'+(number-1)}>← Previous</a>:<span/>}{number<book.chapterCount-1?<a className="kb-button" href={'#/workspace/books/'+book.id+'/'+(number+1)}>Next chapter <Glyph name="arrow" size={17}/></a>:number===book.chapterCount-1?<button className="kb-button" onClick={finish}>Finish book <Glyph name="check" size={17}/></button>:<a className="kb-button" href="#/workspace/books">Back to bookshelf</a>}</div><p className="reader-source">Text: <a href={book.sourceUrl} target="_blank" rel="noopener noreferrer">Project Gutenberg</a> · <a href={'#/workspace/books/'+book.id+'/'+book.chapterCount}>Edition credits and license</a></p></>:<p role="status">Opening your chapter…</p>}</article></div></div>;
}
