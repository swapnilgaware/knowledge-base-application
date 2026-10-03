export type Article={id:string;title:string;summary:string;topic:string;tags:string[];minutes:number;art:string;body:string[]};
export const articles:Article[]=[
 {id:'graph-rag',title:'Your knowledge is a network. Start connecting the dots.',summary:'A practical introduction to the relationships between what you read.',topic:'AI',tags:['graph-rag','knowledge'],minutes:4,art:'graph',body:[
 'A reading library becomes more useful when you can see how its ideas connect. Start with a few concepts you keep encountering, then attach them to the passages that explain them.',
 'A knowledge graph represents concepts and their relationships. A useful connection is more than a line: it needs a source you can revisit and an explanation of why it matters.',
 'Graph-based retrieval follows those connections to gather context from multiple sources. It still needs good source text, clear ownership rules, and checks that the answer is supported.',
 'Try this: create a mindmap with one topic at its center. Add sources, key ideas, questions, and related concepts. Keep it small enough to explain in your own words.']},
 {id:'active-recall',title:'Read less on autopilot. Remember more of what matters.',summary:'Turn your next reading session into a conversation with the material.',topic:'Learning',tags:['active-recall','study'],minutes:3,art:'recall',body:[
 'After a short reading session, close the material and explain its central idea without looking. The gaps in your explanation tell you where to focus next.',
 'Write three questions that the reading answers. Answer them later from memory, then check against the source. Keep the original passage nearby to correct your understanding.',
 'Use a mixture of definitions, comparisons, examples, and applications. A question such as “Why does this work?” asks something different from “What is this called?”',
 'Try this: read a chapter from Books. Put a question on a mindmap branch and return to it in your next study session.']},
 {id:'agent-workflows',title:'Good agents need a clear job, a boundary, and a handoff.',summary:'Think in small, inspectable steps before designing a multi-agent system.',topic:'AI',tags:['agents','workflows'],minutes:5,art:'agents',body:[
 'Break a research workflow into tasks you can inspect: finding a source, extracting text, organizing evidence, drafting a summary, and checking claims.',
 'Specify what each step receives, what it may do, and what it must return. A summary step should return source references alongside its claims.',
 'A coordinator passes work between steps and handles retries, cancellation, and limits. Clear state makes it easier to resume a failed run.',
 'Automated research agents are planned for this workspace. For now, sketch their steps and evidence requirements in a mindmap.']},
 {id:'systems',title:'Look for the feedback loop, not just the moving parts.',summary:'A small shift in perspective for understanding complicated topics.',topic:'Systems',tags:['systems-thinking','connections'],minutes:4,art:'systems',body:[
 'A system is shaped by interactions as well as individual parts. When something changes, ask what it affects next and what eventually comes back to influence it.',
 'Draw a reinforcing loop and a balancing loop from a topic you study. Label the connections so you can explain their direction and assumptions.',
 'Notice delays. A response that takes time can make behavior differ from what you expect after a single observation.',
 'Try starting a mindmap with a question. Add observations, possible causes, and missing evidence as separate branches.']},
 {id:'reading-notes',title:'Build a reading habit that leaves something behind.',summary:'Collect ideas without collecting clutter.',topic:'Learning',tags:['reading','notes'],minutes:3,art:'notes',body:[
 'Before opening a book, choose one question you want to explore. It gives your reading a direction.',
 'Afterward, keep one idea, one connection, and one question. Write them in your own words and keep their chapter reference.',
 'Return to older ideas. If you would explain one differently now, record the change instead of treating the first version as permanent.',
 'Books saves your reading position. Mindmaps connects the ideas you keep. A dedicated notes editor is a later feature.']},
 {id:'java-jpa',title:'Keep identity separate from the knowledge it owns.',summary:'The foundation for a personal workspace across devices.',topic:'Backend',tags:['java','jpa'],minutes:4,art:'code',body:[
 'Authentication answers who is signed in. Application data answers what that account owns.',
 'Keycloak manages sign-in here. Spring Boot resolves the identity to a profile, and JPA associates private mindmaps, bookmarks, and reading positions with it.',
 'Each request checks ownership on the server. A client-provided identifier is a lookup request, not permission to access a record.',
 'Shared demo books are available to signed-in users. Your reading position, saved articles, and mindmaps belong to your account.']}
];
