# Implementation roadmap

Each milestone should be a independently usable increment. Checkboxes describe implementation status, not promises that services already exist.

## 0. Repository and initial UI

- [x] Public repository, product requirements, architecture, and agent roles.
- [x] Local Git checkout connected to GitHub.
- [x] Responsive landing page and login UI preview.
- [x] Landing navigation and Keycloak sign-in entry page.
- [x] Type checking and production build.

## 1. Database-backed login

- [x] Java 25 / Spring Boot backend and PostgreSQL with Flyway migrations.
- [x] Spring Data JPA user model and derived repository methods; no native queries.
- [x] Three Keycloak development users and idempotent JPA profile seeding.
- [x] Keycloak authorization code login, current-user endpoint, session restore, and provider sign-out.
- [x] HttpOnly sessions, login session rotation, CSRF, and protected API routes.
- [ ] Account creation, email verification, password recovery, and Google sign-in.
- [ ] Deployment session persistence and login rate limits.

Exit: a user can sign in and sign out of a real account, with access checks enforced by the backend.

## 2. Private account and multi-device library

- [x] Daily.dev-inspired feed, original guides, filters, search, and persisted saved articles.
- [x] Authenticated demo book catalog and onsite chapter reader with saved reading progress.
- [x] Private editable mindmaps with version checks and account-isolation tests.
- [x] Responsive phone and desktop workspace navigation.
- [x] JPA library schema and ownership enforcement for private records.
- [ ] Notes and reading records with stable IDs and revisions.
- [ ] Topic tags, search, reading status, and backup/export.
- [ ] Persist notes and reading status across phone and desktop.
- [ ] Conflict-aware editing, backups, deletion/export, and isolation tests.
- [ ] Installable PWA and an explicit offline cache policy.

Exit: a note created on a phone appears on desktop after sign-in, and another account cannot retrieve it.

## 3. Reading and ingestion

- [ ] File upload and private object storage.
- [ ] PDF/EPUB and pasted text extraction with page/section anchors.
- [ ] RSS and permitted HTML extraction; isolated browser fallback.
- [ ] Import state, deduplication, retries, highlights, and source provenance.

Exit: a permitted article and a user-supplied book can be indexed, inspected, retried, and deleted with all derived data.

## 4. Cited retrieval and summaries

- [ ] Server-side model adapter, explicit provider configuration, and budgets.
- [ ] Chunking, embeddings, keyword/vector baseline, and evaluation corpus.
- [ ] Short and detailed summaries with source locators and coverage labels.
- [ ] Citation validation, insufficient-evidence behavior, and prompt-injection cases.

Exit: answers to the evaluation questions cite correct passages and unanswerable questions abstain.

## 5. GraphRAG

- [ ] Entity and relation extraction, evidence attribution, and alias resolution.
- [ ] Incremental graph indexing and deletion/reindex propagation.
- [ ] Hybrid retrieval with bounded graph expansion and graph exploration UI.
- [ ] Baseline comparison; add community summaries/global search if justified.

Exit: graph retrieval improves the selected cross-source tasks without weakening citations or access control.

## 6. Research and study agents

- [ ] Durable coordinator, discovery, summary, coach, and evidence-review workflows.
- [ ] Topic subscriptions, approved sources, cadence, cancellation, and cost caps.
- [ ] Discovery inbox, cited digests, and new-book metadata discovery.
- [ ] Editable study plans, flashcards, recall exercises, and spaced review.

Exit: one topic subscription produces a reviewable digest and study plan with traceable sources and bounded cost.

## 7. Release readiness

- [ ] End-to-end mobile/desktop tests, keyboard access, and offline conflict tests.
- [ ] Operational monitoring, recovery drills, dependency audit, and security review.
- [ ] Deployment and user documentation.
- [ ] Evaluate native packaging only if PWA capabilities are insufficient.
