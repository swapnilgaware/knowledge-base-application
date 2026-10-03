import {useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {Glyph} from './WorkspaceUI';

type Message={id:number;role:'assistant'|'user';text:string};
const welcome:Message={id:0,role:'assistant',text:'Hi! I’m your learning assistant. Try a sample conversation about books, interview practice, or resumes. This is a UI demo; I’m not connected to your content or an AI service yet.'};
function demoReply(message:string){
 if(/resume|cv|job|jd/i.test(message))return 'Sample workflow: choose a profile in Resume Builder, add a job description, attach your base resume, and describe the changes you want in the prompt. Keep the experience accurate and review each version before using it. A connected assistant will help tailor it later.';
 if(/interview|question|practice/i.test(message))return 'Sample practice session: pick a topic in Interview, answer a question aloud, then open the expected-answer panel. Compare your explanation with the key points and try the follow-up question. A connected assistant will provide personalized feedback later.';
 if(/book|read|summary|summar/i.test(message))return 'Sample reading routine: choose a chapter, write its main idea in one sentence, and note three points you want to remember. Connect one idea to something you already know. Book-specific summaries will become available when the assistant service is connected.';
 return 'This is a sample response to show the chat experience. You can ask about reading, interview preparation, or resume building. Your message has not been sent to an AI service; personalized answers and knowledge-base search will be added later.';
}

export function AIChat(){
 const [open,setOpen]=useState(false);const [input,setInput]=useState('');const [messages,setMessages]=useState<Message[]>([welcome]);
 const launcher=useRef<HTMLButtonElement>(null);const composer=useRef<HTMLTextAreaElement>(null);const transcript=useRef<HTMLDivElement>(null);const nextId=useRef(1);
 useEffect(()=>{if(open)composer.current?.focus();},[open]);
 useEffect(()=>{if(open&&transcript.current)transcript.current.scrollTop=transcript.current.scrollHeight;},[messages,open]);
 function close(){setOpen(false);launcher.current?.focus();}
 function send(text:string){const trimmed=text.trim();if(!trimmed)return;setMessages(current=>[...current,{id:nextId.current++,role:'user' as const,text:trimmed},{id:nextId.current++,role:'assistant' as const,text:demoReply(trimmed)}]);setInput('');composer.current?.focus();}
 function submit(event:FormEvent){event.preventDefault();send(input);}
 return <>
  <button ref={launcher} className={'kb-ai-chat-launcher'+(open?' active':'')} aria-label={open?'Close AI chat':'Open AI chat'} title="AI chat · Demo" aria-expanded={open} aria-controls="kb-ai-chat-panel" onClick={()=>open?close():setOpen(true)}><Glyph name="chat" size={20}/><span>AI chat<small>Learning assistant</small></span></button>
  {open&&<section id="kb-ai-chat-panel" className="kb-ai-chat-panel" role="dialog" aria-label="AI learning assistant" onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();close();}}}>
   <header><span className="kb-ai-chat-mark"><Glyph name="spark" size={20}/></span><div><h2>Your learning assistant</h2><span>AI chat · UI demo</span></div><button className="kb-icon-button" aria-label="Close chat panel" onClick={close}><Glyph name="close" size={18}/></button></header>
   <p className="kb-ai-chat-notice">Sample responses · AI integration coming later</p>
   <div className="kb-ai-chat-transcript" ref={transcript} role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions">{messages.map(message=><div className={'kb-chat-message '+message.role} key={message.id}><span>{message.role==='user'?'You':'Assistant · Demo'}</span><p>{message.text}</p></div>)}</div>
   {messages.length===1&&<div className="kb-ai-chat-suggestions" aria-label="Suggested messages">{['Help me study a book','Practice an interview','Improve my resume'].map(text=><button key={text} onClick={()=>send(text)}>{text}<Glyph name="arrow" size={13}/></button>)}</div>}
   <form onSubmit={submit}><label className="kb-overline" htmlFor="kb-chat-input">YOUR MESSAGE</label><div><textarea id="kb-chat-input" ref={composer} rows={2} maxLength={2000} placeholder="Ask about your learning…" value={input} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();send(input);}}}/><button className="kb-icon-button" type="submit" disabled={!input.trim()} aria-label="Send message"><Glyph name="arrow" size={19}/></button></div><footer><span>Enter to send · Shift + Enter for a new line</span><button type="button" onClick={()=>{setMessages([welcome]);setInput('');composer.current?.focus();}}>Clear chat</button></footer></form>
  </section>}
 </>;
}
