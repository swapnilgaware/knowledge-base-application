# Knowledge Base Application

A personal learning workspace for books, blogs, notes, and the topics you want to understand, designed for phone and desktop.

## Current milestone: landing page and Keycloak login

Responsive React/TypeScript landing and login pages, a minimal authenticated welcome screen, Java 25 / Spring Boot 4.1.1, PostgreSQL 18, and Keycloak 26.8.0.

Keycloak owns credentials and signs users in through OpenID Connect authorization code flow. Spring Boot validates the identity and keeps an HttpOnly session. Tokens stay on the server. Sign-out ends both the application and Keycloak sessions. CSRF protects state-changing requests.

Spring Data JPA stores application profiles using derived repository methods, with no native application queries. Flyway manages schema changes; Hibernate validates the schema. Profile ownership uses the OpenID Connect issuer and subject, never an email supplied by the browser.

The book and note cards are illustrations. Notes, libraries, GraphRAG, agents, scraping, study tools, registration, and password recovery are future milestones.

## Three local demo users

| Name | Email | Local password variable |
| --- | --- | --- |
| Alex Morgan | alex@example.com | DEMO_ALEX_PASSWORD |
| Sam Rivera | sam@example.com | DEMO_SAM_PASSWORD |
| Taylor Chen | taylor@example.com | DEMO_TAYLOR_PASSWORD |

The setup script generates random local passwords and secrets in ignored .env and realm-import files. Read the password variables from your local .env to sign in. Docker imports the users into the `knowledge-base` realm; the backend's `dev` profile seeds their JPA metadata. Keycloak keeps its own PostgreSQL database, separate from the application's database.

## Run locally

Requirements: Node.js 22.16+, npm, Java 25, Maven 3.9+, Docker Desktop. A portable Java 25 JDK can live in the ignored `.tools/` directory; the Windows runner selects it automatically.

Generate local configuration, then start the database and Keycloak:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-dev.ps1
docker compose up -d
```

Wait for [Keycloak discovery](http://127.0.0.1:8180/realms/knowledge-base/.well-known/openid-configuration) to respond, then start the backend:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backend.ps1 run
```

In another terminal:

```sh
npm ci
npm run dev
```

Open [the application](http://127.0.0.1:5173/) or [sign in](http://127.0.0.1:5173/#/login). Choose **Continue with Keycloak**, then enter a demo user's credentials. The welcome page restores your session on reload.

The [local Keycloak admin console](http://127.0.0.1:8180/admin/) uses username `admin` and the `KEYCLOAK_ADMIN_PASSWORD` from your local .env. The checked-in template is `infra/keycloak/realm-template.json`; setup generates the ignored credential-bearing import `infra/keycloak/knowledge-base-realm.json`. Import skips an existing realm; editing this fixture will not overwrite existing users or passwords. Use the admin console for subsequent changes.

Vite proxies `/api`, `/oauth2`, and `/login/oauth2` to Spring Boot on port 8080. Use `127.0.0.1` consistently because cookies, the issuer, and registered redirect URIs must match.

## Verify and build

```sh
npm run check
npm run build
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backend.ps1 test
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backend.ps1 package
```

Backend tests require PostgreSQL and use mocked OIDC metadata/principals. They verify API protection, login redirects, all three profile mappings, CSRF and session invalidation, identity collision rejection, and idempotent metadata seeding. Real Keycloak login, invalid credentials, session restore, and provider logout were also checked in the browser. CI provisions an isolated PostgreSQL service.

On another OS, load the local .env variables into your process environment, set `JAVA_HOME` to Java 25, and run `mvn spring-boot:run -Dspring-boot.run.profiles=dev` from `backend/`.

Build outputs are `dist/` and `backend/target/`. Docker volumes persist both databases; `docker compose stop` preserves them. Services bind to localhost. This Compose setup runs Keycloak in development mode; deployment requires HTTPS, separate secrets/realm configuration, and production Keycloak settings. No deployment has been made.

## Updating GitHub

This directory is a Git checkout connected to the public repository:

```sh
git status
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

Keep personal notes, books, real credentials, and exports out of this public repository.

## Product direction

- Private reading library, highlights, and notes.
- Topic discovery for accessible blogs and new books.
- Cited summaries, connected knowledge, and GraphRAG.
- Research, curation, evidence review, and study agents.
- Editable learning paths, flashcards, and review schedules.
- Shared phone and desktop access, starting with a PWA.

## Repository map

| Path | Purpose |
| --- | --- |
| src/ | Landing, login, welcome, session API, responsive styles |
| backend/ | Java 25 / Spring Boot / JPA / Flyway API and tests |
| compose.yml | Application database, Keycloak, and its database |
| infra/keycloak/ | Credential-free realm template; generated import is ignored |
| scripts/backend.ps1 | Windows Java 25 backend runner |
| docs/ | Product, architecture, planned agents, roadmap |
| .github/workflows/ | Frontend builds and PostgreSQL-backed API checks |

See [backend setup](backend/README.md), [architecture](docs/architecture.md), and [roadmap](docs/roadmap.md). No license has been selected.
