# Knowledge Base API

Java 25, Spring Boot 4.1.1, Spring Security OAuth2 Client, Spring Data JPA, PostgreSQL 18, and Flyway.

## Authentication and persistence

Keycloak provides OpenID Connect authorization code login. Spring Security validates tokens, rotates the local session on login, and stores provider tokens on the server. The browser receives an HttpOnly, SameSite=Lax cookie. CSRF is enabled; logout ends the local session and redirects through Keycloak's end-session endpoint.

`AppUser` contains profile metadata and an issuer/subject identity pair. Application code uses `JpaRepository` and derived methods only. Flyway SQL files manage schema DDL. V2 removes the old password column without changing profile IDs. The development seeder links only the three fixture identities; new verified identities are provisioned by issuer and subject. Email collisions are rejected, never used to merge accounts.

## Start

From the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-dev.ps1
docker compose up -d
# Start npm run dev in another terminal, then wait for app-origin Keycloak discovery.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backend.ps1 run
```

The Windows script selects an ignored `.tools/jdk-25*` JDK if available, caches Maven artifacts in `.tools/m2`, and uses a full local socket directory beside the checkout to avoid Windows Java NIO startup issues.

Elsewhere, select Java 25 and run `mvn spring-boot:run -Dspring-boot.run.profiles=dev` here.

## Configuration

| Variable | Default / purpose |
| --- | --- |
| DB_URL | jdbc:postgresql://127.0.0.1:5433/knowledgebase |
| DB_USER | knowledgebase |
| DB_PASSWORD | Required; generated in local .env |
| KEYCLOAK_ISSUER | http://127.0.0.1:5173/auth/realms/knowledge-base |
| KEYCLOAK_CLIENT_ID | knowledge-base-web |
| KEYCLOAK_CLIENT_SECRET | Required; generated in local .env |
| APP_FRONTEND_URL | http://127.0.0.1:5173; callback and logout origin |
| SERVER_ADDRESS | 127.0.0.1 |
| SERVER_PORT | 8080 |
| SESSION_COOKIE_SECURE | true outside dev; false in dev |

The run script activates `dev`; no profile is activated by default. Compose reads ignored .env. The Windows runner loads its values into the backend process; direct Maven runs need those environment variables supplied explicitly. Outside development, configure an independent realm/client, secrets, HTTPS, exact callback/logout URIs, and appropriate session persistence. The credential-free template generates an ignored realm import using local secrets. Existing realm imports are skipped on restart. This is not a deployment configuration.

## Routes

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | /api/health | Public health response |
| GET | /api/auth/csrf | Masked CSRF token, header name, parameter name |
| GET | /oauth2/authorization/keycloak | Starts browser login through Keycloak |
| GET | /login/oauth2/code/keycloak | Spring Security authorization-code callback |
| GET | /api/auth/me | Safe current profile; anonymous sessions return 401 |
| POST | /api/auth/logout | Requires CSRF; invalidates session and redirects to Keycloak |
| GET | /api/books | Shared catalog with the current account's reading progress |
| GET | /api/books/{id}/contents | Chapter headings, including edition credits |
| GET | /api/books/{id}/chapters/{number} | One chapter as readable JSON; zero-based chapter index |
| PUT | /api/books/{id}/progress | Save chapter position and completion; requires CSRF |
| GET | /api/saved-posts | Current account's saved starter-guide IDs |
| PUT / DELETE | /api/saved-posts/{postId} | Save or unsave a known guide; requires CSRF |
| GET / POST | /api/mindmaps | List owned maps or create a validated map |
| GET / PUT | /api/mindmaps/{id} | Read or update an owned map; updates require its version |

The frontend submits logout as a browser form with a fresh CSRF token so provider redirects work without cross-origin fetches. The branded username/password form is served by local Keycloak under the application's `/auth` path. Passwords go only to that form, not to a custom Spring password endpoint. There is no custom password-login endpoint and no browser token storage.

A production reverse proxy must route `/api`, `/oauth2`, `/login/oauth2`, the application realm under `/auth/realms/knowledge-base`, and login assets under `/auth/resources` on the frontend origin. Keep administrative Keycloak routes separate. The dev profile uses direct local token, userinfo, and JWKS addresses for backend exchanges while retaining the public app issuer. Keep the registered callback and post-logout URIs aligned with `APP_FRONTEND_URL`.

## Validation

V3 adds shared books and chapters, account-specific reading progress and saved articles, and private mindmaps. Ownership is derived from the authenticated profile, never from an owner ID in the request. Mindmaps require one root, connected acyclic branches, unique IDs, and up to 60 ideas. Optimistic version checks reject stale updates with HTTP 409. All mutations require CSRF. The dev profile seeds the three bundled book editions; production has no automatic book seed or upload endpoint yet.

Run `scripts/backend.ps1 test` from the root with PostgreSQL running, or `mvn test` here. Nine integration tests use mocked provider metadata and OIDC principals with real JPA/PostgreSQL persistence. They cover authentication, book contents, progress, bookmarks, account isolation, malformed maps, and edit conflicts. Browser checks exercise real Keycloak login, the feed, reading and mindmap editing on desktop and phone widths.
