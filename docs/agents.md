# Agent design

These agents are planned. The starter does not execute agents or make model calls.

| Role | Inputs | Tools | Output |
| --- | --- | --- | --- |
| Research coordinator | Topic, objective, source allowlist, budget | Workflow state and task queue | Bounded research plan |
| Discovery agent | Topic and recency preference | RSS, publisher APIs, approved search/book catalogs | Ranked source candidates with access/coverage metadata |
| Ingestion worker | Approved source reference | HTTP extractor, isolated browser, PDF/EPUB parser | Versioned text and source locators |
| Knowledge curator | Chunks and existing entity candidates | Entity resolver and graph writer | Evidence-backed entities/edges and duplicate suggestions |
| Summary agent | Indexed passages and requested depth | Retriever, model adapter | Cited summary and open questions |
| Study coach | Objective, cited concepts, progress | Retriever, card/plan writer | Editable study sequence and practice questions |
| Evidence reviewer | Claims and cited passages | Citation resolver | Supported/unsupported verdicts and revision requests |

The ingestion worker is primarily deterministic. Use model decisions where they improve the result, rather than treating every function as an autonomous agent.

## Run contract

```ts
type AgentRun = {
  id: string;
  workspaceId: string;
  objective: string;
  sourceIds: string[];
  allowedTools: string[];
  budget: { maxSteps: number; maxTokens: number; maxCost: number };
  state: 'queued' | 'running' | 'waiting_for_user' | 'completed' | 'failed' | 'cancelled';
  checkpointId?: string;
  artifacts: { id: string; kind: string; sourceVersionIds: string[] }[];
  error?: { code: string; retryable: boolean; message: string };
};
```

## Execution rules

Enforce tool scope in application code, not only in prompts. Apply timeouts, bounded retries, per-host limits, deduplication, and cancellation. Checkpoint after successful stages. Discovery suggestions enter an inbox unless the user has enabled automatic ingestion for that source. Scheduling belongs to an explicit user topic subscription with cadence and cost limits.

Models receive evidence and narrow output schemas. They do not receive deployment credentials or arbitrary filesystem/network access. Prompt-like instructions found in a document remain source content. Unsupported claims trigger revision or an explicit insufficient-evidence result.

## Example end-to-end workflow

For a request to learn distributed systems: resolve the goal and available time; find accessible material in approved sources and the existing library; let the user review new candidates; index accepted material; retrieve passages and graph relationships; generate a cited synthesis; review evidence; propose prerequisites, reading sessions, and practice questions; record user edits and review outcomes.

Discovery must label a book with only catalog data as **metadata only**. A book summary requires actual accessible text and must disclose whether it covers an excerpt or the entire work.
