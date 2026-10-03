import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { currentUser, signIn } from './auth';
import Workspace from './Workspace';
import type { UserProfile } from './auth';

function Arrow({ back = false }: { back?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={back ? 'M20 12H4m0 0 6-6m-6 6 6 6' : 'M4 12h16m0 0-6-6m6 6-6 6'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Mark() {
  return <svg className="brand-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true"><rect width="36" height="36" rx="11" fill="currentColor"/><path d="m12 12 12 12M12 24l12-12" stroke="#f4f1e8" strokeWidth="1.4"/><circle cx="12" cy="12" r="3" fill="#f4f1e8"/><circle cx="24" cy="12" r="3" fill="#c0d59c"/><circle cx="12" cy="24" r="3" fill="#c0d59c"/><circle cx="24" cy="24" r="3" fill="#f4f1e8"/></svg>;
}
function Brand({ light = false }: { light?: boolean }) {
  return <a href="#/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Knowledge Base home"><Mark/><span>knowledge<span className="brand-serif">base</span><span className="brand-period">.</span></span></a>;
}
function Icon({ type }: { type: 'book' | 'note' | 'connect' }) {
  const paths: Record<string, ReactNode> = {
    book: <><path d="M12 5C8 2 4 3 3 4v15c3-1 6-1 9 1m0-15c4-3 8-2 9-1v15c-3-1-6-1-9 1V5Z"/><path d="M6 8h3m6 0h3"/></>,
    note: <><path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8M8 16h5"/></>,
    connect: <><path d="m7 7 10 10M7 17 17 7M7 7v10m10-10v10"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/></>,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function Landing() {
  return <div className="landing">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><Brand/><nav aria-label="Main navigation"><a className="nav-about" href="#vision">The idea</a><a className="nav-login" href="#/login">Sign in <Arrow/></a></nav></header>
    <main id="main">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="tiny-star">✳</span> FOR THE ENDLESSLY CURIOUS</div><h1>A home for<br/>everything you<br/><em>want to know.</em></h1><p className="hero-description">Your books, notes, and discoveries — connected.<br className="desktop-break"/> A personal space to turn a little reading into<br className="desktop-break"/> a deeper understanding.</p><div className="hero-actions"><a className="button primary" href="#/login">Start your journey <Arrow/></a><a className="subtle-link" href="#vision">Take a closer look <span aria-hidden="true">↙</span></a></div><div className="hero-footnote"><span className="device-icon" aria-hidden="true">▱</span> One place for your ideas. Wherever you are.</div></div>
        <div className="workspace-art" aria-label="Illustration of a future personal knowledge workspace">
          <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><span className="art-star star-one" aria-hidden="true">✳</span><span className="art-star star-two" aria-hidden="true">✧</span>
          <svg className="art-lines" viewBox="0 0 560 500" fill="none" aria-hidden="true"><path d="M155 135C40 225 120 320 290 310S480 370 490 210" stroke="#a5b391" strokeWidth="1.5" strokeDasharray="5 6"/><path d="M395 120c30 25 45 40 56 85" stroke="#a5b391" strokeWidth="1.5" strokeDasharray="5 6"/><circle cx="152" cy="138" r="5" fill="#45634b"/><circle cx="485" cy="245" r="5" fill="#45634b"/></svg>
          <article className="preview-book"><div className="mini-label"><span className="mini-dot"/> ON YOUR READING SHELF<span>↗</span></div><div className="book-content"><div className="book-cover"><span>DONELLA<br/>MEADOWS</span><strong>Thinking<br/>in Systems</strong><div className="cover-orbits"/><small>A PRIMER</small></div><div className="book-details"><span className="preview-type">BOOK</span><h2>Thinking in<br/>Systems</h2><p>Donella H. Meadows</p><span className="reading-pill">Reading</span></div></div><div className="book-bottom"><span>Systems thinking</span><span>+ 3 ideas</span></div></article>
          <article className="preview-note"><div className="note-heading"><span className="note-icon"><Icon type="note"/></span><span>AN IDEA WORTH KEEPING</span><span className="note-dots">···</span></div><h2>The whole is more<br/>than the sum of its parts.</h2><p>Look for the connections, not just<br/>the individual pieces.</p><div className="note-tags"><span>systems</span><span>mental models</span></div></article>
          <div className="connection-pill"><span className="connection-symbol" aria-hidden="true">✧</span><div><strong>Ideas, connected.</strong><span>A bigger picture, one note at a time.</span></div></div>
          <span className="preview-caption">A glimpse of the workspace we're building</span>
        </div>
      </section>
      <section className="vision" id="vision"><div className="vision-heading"><span className="eyebrow">A SMALL START. A BIGGER PICTURE.</span><h2>Less scattered.<br/><em>More connected.</em></h2><p>We're building a thoughtful home for your learning.<br/>Starting with a simple welcome, growing one feature at a time.</p></div><div className="feature-grid">{[
        ['book','Keep your reading close','A future library for the books, articles, and passages you want to return to.','01'],
        ['note','Give your ideas a home','A place to capture your thoughts and make connections as your understanding grows.','02'],
        ['connect','Go a little deeper','AI summaries, connected knowledge, and study guidance are part of the journey ahead.','03'],
      ].map(([type,title,description,n])=><article className="feature-card" key={n}><div className="feature-top"><span className="feature-icon"><Icon type={type as 'book'|'note'|'connect'}/></span><span className="feature-number">{n}</span></div><h3>{title}</h3><p>{description}</p><span className="feature-status">On the roadmap</span></article>)}</div></section>
      <section className="closing"><div><span className="eyebrow">KEEP YOUR CURIOSITY GOING</span><h2>Your next chapter<br/>starts with a question.</h2></div><a className="button primary" href="#/login">Find your space <Arrow/></a><span className="closing-star" aria-hidden="true">✳</span></section>
    </main>
    <footer className="site-footer"><Brand/><span>A little reading. A lasting connection.</span><a href="https://github.com/swapnilgaware/knowledge-base-application" target="_blank" rel="noopener noreferrer">Follow the project ↗</a></footer>
  </div>;
}

function Login() {
  const message = new URLSearchParams(window.location.search).has('authError')
    ? 'Sign-in could not be completed. Please try again.' : '';
  return <main className="login-page">
    <section className="login-story"><Brand light/><div className="story-copy"><span className="eyebrow">COME BACK TO YOUR CURIOSITY</span><h1>A little reading.<br/>A lasting<br/><em>connection.</em></h1><p>A home for the things you discover,<br/>and the ideas they leave behind.</p></div><div className="story-graph" aria-hidden="true"><svg viewBox="0 0 500 280" fill="none"><path d="M60 180 200 90l180 80-85 90-95-170 160-60" stroke="#7a9275" strokeWidth="1"/><circle cx="60" cy="180" r="9" fill="#bad293"/><circle cx="200" cy="90" r="18" fill="#e8ecdf"/><circle cx="380" cy="170" r="11" fill="#bad293"/><circle cx="295" cy="260" r="7" fill="#829879"/><circle cx="360" cy="30" r="6" fill="#829879"/><circle cx="200" cy="90" r="33" stroke="#7a9275" strokeDasharray="3 6"/></svg><span className="graph-label graph-label-one">a new idea</span><span className="graph-label graph-label-two">a deeper understanding</span></div><span className="story-footer">YOUR PERSONAL LEARNING SPACE</span></section>
    <section className="login-form-panel"><a href="#/" className="back-link"><Arrow back/> Back to home</a><div className="login-form-wrap"><span className="login-kicker">WELCOME TO KNOWLEDGE BASE</span><h2>Room for your<br/><em>next idea.</em></h2><p className="login-intro">Sign in to your personal learning space.</p><div className="preview-notice"><span/> Development accounts <p>Alex, Sam, and Taylor are available. Use alex@example.com, sam@example.com, or taylor@example.com with the local password from your .env file.</p></div><button className="button primary sign-in-submit" type="button" onClick={signIn}>Continue with Keycloak <Arrow/></button><p className="login-intro">You'll enter your email and password on the secure sign-in page.</p>{message&&<p className="auth-message" role="status">{message}</p>}<p className="login-bottom">A place to keep learning.<span aria-hidden="true">✧</span></p></div><footer className="login-footer">Thoughtfully built for a curious mind.</footer></section>
  </main>;
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    currentUser().then(profile => { if (active) setUser(profile); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(()=>{
    const navigate=()=>{setRoute(window.location.hash); if(window.location.hash.startsWith('#/')) window.scrollTo(0,0);};
    window.addEventListener('hashchange',navigate);
    return ()=>window.removeEventListener('hashchange',navigate);
  },[]);
  useEffect(() => {
    if (!loading && route.startsWith('#/workspace') && !user) window.location.hash = '#/login';
    if (!loading && route === '#/login' && user) window.location.hash = '#/workspace';
  }, [loading, route, user]);
  useEffect(()=>{ document.title=route.startsWith('#/workspace')?'Your workspace — Knowledge Base':route==='#/login'?'Sign in — Knowledge Base':'Knowledge Base — A home for your curiosity'; },[route]);
  if (route.startsWith('#/workspace') && loading) return <main className="session-loading" role="status">Opening your workspace…</main>;
  if (user && route !== '#/login') return <Workspace user={user} route={route.startsWith('#/workspace') ? route : '#/workspace'}/>;
  return route==='#/login'?<Login/>:<Landing/>;
}
