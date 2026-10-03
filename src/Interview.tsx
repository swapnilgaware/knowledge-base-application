import {useState} from 'react';
import {Empty,Glyph} from './WorkspaceUI';

// Demo content only. A future service will supply questions and verified sources.
const demoQuestions = [
 {id:'java-concurrency',topic:'Java',level:'Intermediate',question:'How would you choose between virtual threads and a thread pool?',context:'Backend Developer · Concurrency',focus:['Explain blocking I/O versus CPU-bound work.','Discuss concurrency limits and access to shared resources.','Describe how you would measure throughput and latency.']},
 {id:'spring-api',topic:'Spring Boot',level:'Intermediate',question:'How would you design a secure, testable REST API in Spring Boot?',context:'Java Backend Developer · API design',focus:['Separate controllers, services, and persistence.','Cover authentication, authorization, validation, and consistent errors.','Explain your integration tests and transaction boundaries.']},
 {id:'jpa-query',topic:'Databases',level:'Intermediate',question:'What is the N+1 query problem, and how would you diagnose it with JPA?',context:'Backend Developer · Persistence',focus:['Describe an example involving a collection of entities.','Inspect generated queries and query counts.','Compare fetch joins, entity graphs, and projections; consider pagination.']},
 {id:'sql-index',topic:'Databases',level:'Foundation',question:'When would an index help a PostgreSQL query, and what does it cost?',context:'Software Engineer · SQL',focus:['Start with the filters, joins, and ordering in the query.','Explain query plans and selectivity.','Discuss additional storage and write overhead.']},
 {id:'system-feed',topic:'System design',level:'Advanced',question:'Design a personalized news feed that stays responsive as usage grows.',context:'Full Stack Developer · Architecture',focus:['Clarify requirements, expected traffic, and freshness.','Sketch ingestion, ranking, storage, caching, and pagination.','Explain failure handling and the trade-offs in your design.']},
 {id:'react-state',topic:'Frontend',level:'Intermediate',question:'How would you handle loading, errors, and stale results in a React search UI?',context:'Frontend Developer · User experience',focus:['Describe the state transitions the user sees.','Handle requests that finish out of order.','Cover keyboard access, empty results, and retry behavior.']},
 {id:'rag-quality',topic:'AI / RAG',level:'Intermediate',question:'How would you evaluate whether a RAG system answers from the right sources?',context:'AI Engineer · Retrieval',focus:['Build representative questions with expected supporting evidence.','Evaluate retrieval and answer quality separately.','Check citations, unsupported claims, and behavior when evidence is missing.']},
 {id:'behavioral-tradeoff',topic:'Behavioral',level:'All levels',question:'Tell me about a technical trade-off you made and how you explained it to your team.',context:'All engineering roles · Communication',focus:['Set out the situation, your responsibility, and the alternatives.','Explain the decision and how you involved others.','Share the outcome and what you would change next time.']},
];
const topics=['All topics',...new Set(demoQuestions.map(question=>question.topic))];

export function Interview({query}:{query:string}){
 const [topic,setTopic]=useState('All topics');
 const filtered=demoQuestions.filter(item=>(topic==='All topics'||item.topic===topic)&&[item.question,item.topic,item.context,item.level,...item.focus].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 return <>
  <div className="kb-page-heading"><div><span className="kb-overline">PREPARE WITH PURPOSE</span><h1>Interview<span>.</span></h1><p>A little practice today. A clearer answer tomorrow.</p></div><span className="kb-starter-badge"><span/> Demo collection</span></div>
  <div className="kb-interview-notice"><Glyph name="briefcase" size={21}/><p><strong>Latest interview questions</strong><span>Sample questions for now. Live questions, job matching, and verified sources will be added when the services are connected.</span></p></div>
  <div className="kb-feed-controls"><div>{topics.map(item=><button key={item} className={topic===item?'selected':''} aria-pressed={topic===item} onClick={()=>setTopic(item)}>{item}</button>)}</div><span>{filtered.length} questions</span></div>
  <div className="kb-interview-grid">{filtered.map(item=><article className="kb-interview-card" key={item.id}>
   <div className="kb-interview-meta"><span>{item.topic}</span><span>{item.level}</span></div>
   <h2>{item.question}</h2><p>{item.context}</p>
   <details><summary>Answer pointers <Glyph name="chevron" size={14}/></summary><div><p>Try answering aloud first, then check whether you covered these points.</p><ul>{item.focus.map(point=><li key={point}>{point}</li>)}</ul></div></details>
   <footer>DEMO QUESTION · NOT A REPORTED INTERVIEW</footer>
  </article>)}</div>
  {!filtered.length&&<Empty title="No questions found.">Try another topic or search term.</Empty>}
 </>;
}
