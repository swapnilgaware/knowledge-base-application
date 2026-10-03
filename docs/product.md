# Product scope

## Intended user

A learner who reads books and online articles, writes notes, and wants to connect knowledge across subjects. One account owns a private workspace that can be accessed from phone and desktop.

## Core journeys

| Journey | Intended experience | Current status |
| --- | --- | --- |
| Capture | Write a note; add a book or article; tag topics | Planned |
| Read | Import PDF/EPUB or an accessible article; preserve highlights | Planned |
| Discover | Follow topics and sources; review an agent's suggestions | Planned |
| Understand | Read a short overview or chapter-level summary with evidence | Planned |
| Connect | Explore entities and relationships; ask questions across sources | Planned |
| Study | Set a learning objective; follow a prerequisite-aware plan; review cards | Planned |
| Continue anywhere | Sign in on another device and resume reading or editing | Local PostgreSQL-backed login implemented; library and sync planned |

## Summary output

Each generated summary should include a short overview, key ideas, claims with source citations, important caveats, connections to existing notes, and suggested questions. Keep generated content separate from the user's own writing. Label full-text, excerpt-only, and metadata-only coverage; do not describe a book as read when only its description was available.

## Study output

For a chosen topic, ask for the learner's objective and available time. Generate an ordered path through prerequisite concepts and sources, short explanation exercises, recall questions, and spaced review tasks. Allow the user to change the order and reject suggestions. Learning progress comes from user actions and review outcomes, not from counting generated summaries.

## Acceptance criteria for the first connected release

- The same authenticated account sees saved notes on two devices.
- A user can import a supported book file and a permitted article, inspect processing state, and retry a failed import.
- A summary links each substantive source claim to a retrievable passage.
- A cross-source question returns supporting passages and related graph entities, or explicitly says that evidence is insufficient.
- A topic subscription creates a reviewable discovery inbox; duplicate material is not repeatedly imported.
- A learner can turn a cited summary into an editable study plan and review cards.
- Deleting a source invalidates its derived chunks, embeddings, graph evidence, cached answers, and generated study material as appropriate.
- Keyboard navigation and a 360px-wide viewport support the primary capture and reading flows.

## Scope boundaries

Start with a PWA and a single-user-owned workspace model. Native desktop/mobile shells, collaboration, public publishing, audio, and browser extensions are later decisions. Public GitHub source code and private application data are separate concerns.
