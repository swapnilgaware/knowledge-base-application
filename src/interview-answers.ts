type Answer = {paragraphs:string[];example:string;followUp:string;reference?:{label:string;url:string}};

export const interviewAnswers:Record<string,Answer>={
 'java-concurrency':{
  paragraphs:[
   'I would first determine whether the workload spends most of its time waiting for I/O or doing CPU work. For many independent blocking network or database operations, virtual threads let me keep a straightforward thread-per-task style while supporting more concurrent waiting tasks.',
   'Virtual threads do not make calculations execute faster or create extra CPU capacity. For sustained CPU work, I would use bounded parallelism appropriate to the available cores. I would create a virtual thread for each task rather than pool virtual threads.',
   'I would still protect constrained dependencies. A database connection pool, semaphore, deadlines, and cancellation can limit pressure on downstream services. Shared mutable state still needs correct synchronization. I would compare throughput, tail latency, resource usage, and failures under realistic load before choosing.'
  ],example:'An API that calls several slow services is a good candidate for virtual threads. An image-processing batch needs bounded CPU parallelism. Neither should allow unlimited work against a database with a small connection pool.',
  followUp:'How would you prevent a surge in concurrent requests from overwhelming the database?',
  reference:{label:'Java 25 thread documentation',url:'https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html'}
 },
 'spring-api':{
  paragraphs:[
   'I would start with the API contract: resources, request and response DTOs, validation rules, status codes, and a consistent error format. Controllers would handle HTTP concerns, services would own business rules, and JPA repositories would handle persistence. I would avoid returning persistence entities directly.',
   'I would delegate identity to the configured identity provider and enforce authorization on the server. Authentication identifies the caller; authorization checks whether that caller can perform the operation on this particular record. I would validate inputs, bound list results, and avoid returning internal exception details.',
   'Transactions would cover the business operation that must succeed together. I would test business rules in isolation and use integration tests for security, request validation, persistence, and rollback behavior. Production behavior also needs clear timeouts, observable failures, and a strategy for safe retries.'
  ],example:'For a private notes API, GET /notes/{id} must check ownership. A test should show that user A can read their own note while user B cannot read it, even when B knows its identifier.',
  followUp:'Where would you put ownership checks, and how would you test access by another user?'
 },
 'jpa-query':{
  paragraphs:[
   'N+1 occurs when fetching a list triggers one initial query followed by additional queries for related data. For example, loading twenty books and then reading each lazy author relationship may issue twenty more queries.',
   'I would reproduce the request, inspect generated SQL, and measure query counts. The fetch plan should match the response. A JPA entity graph or a JPQL fetch join can load the needed relationship; a DTO projection is useful when I only need selected fields.',
   'I would not solve it by making every relationship eager. Fetching collections can multiply rows and complicate pagination. For a paged response, I might page identifiers first and fetch required data in a second bounded query. I would confirm both query count and returned results with representative data.'
  ],example:'A bookshelf displaying title and author should fetch those fields deliberately rather than relying on lazy loads while serializing each book.',
  followUp:'Why can a collection fetch join be problematic when combined with pagination?',
  reference:{label:'Spring Data JPA fetch and load graphs',url:'https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html'}
 },
 'sql-index':{
  paragraphs:[
   'An index helps when PostgreSQL can use it to find a relatively small set of matching rows or provide a useful ordering without scanning and sorting the entire table. I would choose it from real query patterns rather than index every column.',
   'I would inspect the execution plan and test with realistic data. Composite indexes need to fit the common predicates and ordering. A sequential scan may still be cheaper when a query needs a large portion of the table.',
   'Each index consumes storage and adds maintenance work to inserts, updates, and deletes. I would keep indexes that demonstrably help important queries, watch their usage, and reassess when the workload changes.'
  ],example:'A notes query filtering by owner and ordering by creation time may benefit from an index on those columns. I would verify the plan and latency before and after adding it.',
  followUp:'Why might PostgreSQL ignore an available index?',
  reference:{label:'PostgreSQL index documentation',url:'https://www.postgresql.org/docs/current/indexes.html'}
 },
 'system-feed':{
  paragraphs:[
   'I would clarify traffic, personalization, freshness, and acceptable delays first. A reasonable initial design separates ingestion from feed delivery: workers collect and normalize content, deduplicate it, and store it; the read API retrieves a ranked page for the user.',
   'I would use stable cursor pagination and cache expensive results where a short freshness delay is acceptable. Ranking could initially use explicit topics, followed by more sophisticated signals once there is evidence they improve relevance. A queue lets ingestion absorb bursts and retry independently of the user request.',
   'I would compare generating feeds on reads with precomputing them on writes. The choice depends on audience size, update volume, and latency goals. If a provider or ranking service fails, I would serve previously available content with a clear freshness signal. I would monitor latency, queue lag, duplicates, and relevance.'
  ],example:'Start with a topic-filtered feed over stored articles. Add cached candidate lists and background ranking when measurements show the simple approach no longer meets latency goals.',
  followUp:'What changes when a single publisher has millions of followers?'
 },
 'react-state':{
  paragraphs:[
   'I would model idle, loading, success, empty, and error states explicitly. The search input should remain responsive, and the user should be able to retry a failed request without losing their query.',
   'Responses can arrive out of order. When the query changes, I would abort the previous request or ignore its result during cleanup so an older response cannot replace newer results. Debouncing can reduce requests, but it does not by itself prevent this race. A data-fetching library can manage caching and request lifecycles.',
   'I would label the input, announce useful status changes, keep keyboard access working, and distinguish an empty result from a failed request. I would verify behavior with rapid typing and slow or failed responses, including leaving the page while a request is in flight.'
  ],example:'If the user types “java” and then “javascript”, a slower response for “java” must not overwrite the results for “javascript”.',
  followUp:'Why is debouncing insufficient to prevent stale results?',
  reference:{label:'React effect cleanup and fetching',url:'https://react.dev/learn/synchronizing-with-effects'}
 },
 'rag-quality':{
  paragraphs:[
   'I would create a representative evaluation set with questions, supporting passages, and examples where the knowledge base has no answer. It should include ambiguous questions, outdated material, and questions requiring evidence from more than one source.',
   'I would evaluate retrieval separately from generation. Retrieval checks whether the useful evidence appears in the returned context. Answer evaluation checks correctness, whether claims are supported by that context, and whether citations point to the passages that actually justify the claims.',
   'I would review failures to distinguish missing documents, weak retrieval, and unsupported generation. When evidence is missing or contradictory, the system should explain the gap instead of guessing. I would rerun the same evaluation set after changes to chunking, retrieval, ranking, or prompts and review important cases manually.'
  ],example:'For a question about an uploaded book, inspect whether the relevant chapter was retrieved and whether the answer cites the correct passage. A plausible answer from a different book should fail the check.',
  followUp:'How would you tell whether a poor answer was caused by retrieval or generation?'
 },
 'behavioral-tradeoff':{
  paragraphs:[
   'Use a real example from your experience and structure it around situation, task, action, and result. State the constraint clearly, explain your own contribution, and make the alternatives concrete.',
   'An illustrative answer: “We needed to ship a search feature under a tight deadline. I compared adding a dedicated search service with improving the database query. I explained the expected latency, operating cost, and delivery effort to the team. We chose the simpler query first and agreed on measurements that would trigger a later redesign.”',
   'Finish with the actual outcome and what you learned. If you have measurements, share them; if you do not, say how you evaluated the result. A strong answer shows judgment, collaboration, and accountability without claiming the decision was perfect.'
  ],example:'The story above is fictional. Replace it with your own project, constraints, decision, and outcome; do not invent achievements or metrics.',
  followUp:'What evidence would have made you choose the other option?'
 }
};
