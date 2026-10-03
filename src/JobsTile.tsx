import {Glyph} from './WorkspaceUI';

// Placeholder roles for the layout. Replace these with personalized API results later.
const sampleJobs = [
 {id:'java',title:'Java Backend Developer',company:'Northstar Labs',location:'Remote',level:'Mid-level',skills:['Java','Spring Boot','PostgreSQL']},
 {id:'ai',title:'AI / ML Engineer',company:'Atlas Research',location:'London · Hybrid',level:'Mid-level',skills:['Python','LLMs','RAG']},
 {id:'fullstack',title:'Full Stack Developer',company:'Bloom Systems',location:'Remote',level:'Mid-level',skills:['React','TypeScript','Java']},
 {id:'platform',title:'Platform Engineer',company:'Orbit Cloud',location:'London · Hybrid',level:'Senior',skills:['Docker','Kubernetes','AWS']},
 {id:'graduate',title:'Graduate Software Engineer',company:'Paperplane Studio',location:'Remote',level:'Entry-level',skills:['Java','APIs','SQL']},
];

export function JobsTile(){
 return <section className="kb-jobs-card" aria-labelledby="kb-jobs-title">
  <div className="space-card-title"><Glyph name="briefcase" size={18}/><h2 id="kb-jobs-title">Latest relevant jobs</h2></div>
  <p className="kb-jobs-intro"><span>DEMO</span> Sample listings · live jobs coming later</p>
  <div className="kb-jobs-scroll" role="region" aria-label="Sample job listings" tabIndex={0}>
   {sampleJobs.map(job=><article className="kb-job" key={job.id}>
    <h3>{job.title}</h3><p className="kb-job-company">{job.company} <span>· Sample</span></p>
    <p className="kb-job-meta">{job.location} · {job.level}</p>
    <div className="kb-job-skills">{job.skills.map(skill=><span key={skill}>{skill}</span>)}</div>
    <a href={'https://www.linkedin.com/jobs/search/?keywords='+encodeURIComponent(job.title)} target="_blank" rel="noopener noreferrer" aria-label={'Explore '+job.title+' roles on LinkedIn (opens in a new tab)'}>Explore roles <Glyph name="arrow" size={13}/></a>
   </article>)}
  </div>
  <p className="kb-jobs-footnote">Fictional examples. Links open role searches, not individual vacancies.</p>
 </section>;
}
