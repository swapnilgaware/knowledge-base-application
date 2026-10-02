# Knowledge Base Application

A personal learning workspace for books, blogs, notes, and the topics you want to understand, designed for phone and desktop.

## First milestone: landing page and login UI

The current version contains a responsive landing page and a separate sign-in screen built with React, TypeScript, and Vite. The landing page illustrates the future workspace and identifies upcoming features. The sign-in screen includes email/password fields, browser form validation, a password visibility control, and a Google sign-in option.

**Authentication is a UI preview.** No accounts are created, no credentials are stored or transmitted, and neither sign-in option starts an authenticated session. Use sample details while reviewing the form. Connecting a real authentication provider is the next milestone.

The book and note cards are illustrative examples, not user data. Notes, the reading library, GraphRAG, agents, scraping, and study tools are described in the roadmap and are not implemented yet.

## Local development

Use Node.js 22.16+ and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173/ for the landing page, or http://127.0.0.1:5173/#/login for the login preview.

```sh
npm run check
npm run build
npm run preview
```

The build creates static assets in `dist/`. The development server binds to localhost by default. Typography loads from Google Fonts with local system fallbacks. This project has not been deployed.

## Updating GitHub

The local project is a Git checkout with `origin` pointing at this repository. After making and checking a change:

```sh
git status
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

For larger changes, use a feature branch and a pull request. Keep private notes, uploaded books, credentials, and exports out of this public repository.

## Product direction

- A private library of books, blogs, highlights, and personal notes.
- Topic-based discovery of accessible blogs and new books.
- Source-grounded summaries with page or section citations.
- A knowledge graph and hybrid GraphRAG retrieval across the library.
- Specialist agents for research, curation, summaries, evidence review, and study coaching.
- Editable learning paths, flashcards, recall exercises, and review schedules.
- A shared account across phone and desktop, with a PWA as the first delivery platform.

## Repository map

```text
src/App.tsx          Landing page, login preview, and navigation
src/styles.css       Visual design and responsive layouts
public/              Favicon
docs/product.md      Future user journeys and acceptance criteria
docs/architecture.md Proposed backend and GraphRAG design
docs/agents.md       Planned agent roles and contracts
docs/roadmap.md      Ordered milestones
.github/workflows/   Type checking and production build
```

The [architecture](docs/architecture.md) proposes authenticated APIs, private data storage, evidence-backed graph retrieval, and durable agent workflows. These services are planned; none is provisioned by this UI.

No license has been selected yet; public visibility alone is not a license grant.
