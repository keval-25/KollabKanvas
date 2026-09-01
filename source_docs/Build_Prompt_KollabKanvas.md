# Build Prompt for Claude Code — KollabKanvas

Copy everything below into  as your project instruction / task prompt.

---

## ROLE

You are acting as a senior full-stack engineer building **KollabKanvas**, a real-time collaborative whiteboard application. You have full access to this repository. Before writing any code, read the two specification documents in full and treat them as the authoritative source of truth for scope, behavior, and design decisions:

- `repo_docs/source_docs/SRS_RealTime_Whiteboard.md` — functional & non-functional requirements
- `repo_docs/source_docs/Design_Document_RealTime_Whiteboard.md` — architecture, schema, API, WebSocket, and deployment design

Do not deviate from the architecture decisions in the Design Document (per-element optimistic-versioning sync, MongoDB as primary DB, Redis Pub/Sub for WS fan-out, server-side RBAC enforcement, server-side AI summarization calls) unless you flag a concrete technical blocker and propose an alternative before implementing it.

---

## PROJECT CONTEXT (already scaffolded)

```
KollabKanvas/
├── backend/                      # Spring Boot (Gradle) — already initialized
│   ├── src/main/java/com/kolab/kanvas/
│   │   ├── KanvasApplication.java
│   │   └── ServletInitializer.java
│   ├── src/main/resources/
│   │   ├── static/
│   │   ├── templates/
│   │   └── application.properties
│   ├── src/test/
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradlew / gradlew.bat
├── frontend/                     # React SPA — to be initialized
└── repo_docs/source_docs/
    ├── SRS_RealTime_Whiteboard.md
    └── Design_Document_RealTime_Whiteboard.md
```

- Backend base package: `com.kolab.kanvas`
- Backend build tool: **Gradle** (not Maven) — use `build.gradle`, not a POM.
- Frontend directory exists but is currently empty — initialize it as a Vite + React + TypeScript project.

---

## TECH STACK (fixed — do not substitute)

| Layer | Technology |
|---|---|
| Backend | Java 17+, Spring Boot 3.x, Spring Web, Spring WebSocket (STOMP/SockJS), Spring Security (JWT), Spring Data MongoDB |
| Frontend | React + TypeScript (Vite), Zustand for state, Axios for REST, `@stomp/stompjs` + `sockjs-client` for WS |
| Database | MongoDB (schema per Design Document §3.1) |
| Cache / WS scaling | Redis (Pub/Sub) |
| Media | Cloudinary (signed uploads) |
| AI | External LLM API called server-side only (never expose the key to the client) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## BUILD ORDER — implement in these phases, and stop for review after each phase before moving to the next

### Phase 0 — Foundation
1. Confirm `build.gradle` has dependencies for: `spring-boot-starter-web`, `spring-boot-starter-websocket`, `spring-boot-starter-security`, `spring-boot-starter-data-mongodb`, `spring-boot-starter-validation`, `spring-boot-starter-actuator`, JWT library (`io.jsonwebtoken:jjwt`), Lombok, and test dependencies (JUnit 5, Spring Boot Test).
2. Set up `application.properties` (and an `application-docker.properties` profile) for MongoDB URI, JWT secret, Redis host, Cloudinary credentials, AI API key — all externalized via environment variables, no secrets committed.
3. Initialize `frontend/` with Vite + React + TypeScript. Set up the folder structure exactly as described in Design Document §8 (`components/canvas`, `components/toolbar`, `components/panels`, `components/dashboard`, `hooks/`, `services/`, `pages/`).
4. Add a root `docker-compose.yml` per Design Document §9.1 (frontend, backend, mongo, redis, nginx services).

### Phase 1 — Auth & User Management (SRS §3.1)
- Implement `User` model, registration, login (JWT access + refresh token), logout/token invalidation, password reset flow.
- Spring Security config enforcing JWT auth on all endpoints except `/auth/**`.
- Frontend: login/register pages, `useAuth` hook, protected route wrapper.

### Phase 2 — Board CRUD (SRS §3.2, Design §3.1, §4)
- Implement `Board`, `BoardElement` models and the REST endpoints listed in Design Document §4 for board create/list/get/rename/archive/delete/duplicate.
- Frontend: dashboard page with board list, create-board modal.

### Phase 3 — Real-Time Collaborative Drawing (SRS §3.3, Design §5)
- Implement STOMP WebSocket config, topics, and the per-element optimistic-versioning conflict resolution exactly as specified in Design Document §5.2–§5.3.
- Wire Redis Pub/Sub for multi-instance broadcast fan-out (Design §5.4).
- Implement presence/cursor broadcast and reconnection resync (Design §5.5).
- Frontend: canvas renderer, toolbar (freehand, rect, ellipse, line/arrow, text, sticky note, image), live cursors, presence avatars, undo/redo per Design §8.

### Phase 4 — Role-Based Access Control (SRS §3.6, Design §7)
- Implement collaborator roles (Owner/Editor/Commenter/Viewer), invite/change/revoke endpoints, share-link generation.
- Enforce roles server-side at both the REST layer (method-level guard) and the WebSocket layer (`ChannelInterceptor` on `preSend`) — never trust client-side role checks.
- Frontend: share/role management modal, role-aware toolbar (disable edit tools for Viewers).

### Phase 5 — AI Board Summarization (SRS §3.4, Design §6)
- Implement server-side extraction of text/structural content from board elements, prompt construction, and the AI API call — never expose the API key client-side.
- Implement summary caching keyed by a snapshot-version hash (Design §6.3) and rate limiting.
- Frontend: summary panel with "Summarize"/"Regenerate" actions.

### Phase 6 — Transcript per User (SRS §3.5)
- Implement append-only transcript logging on every relevant action (element ops, comments, role changes, join/leave).
- Implement filterable transcript retrieval and CSV/PDF export endpoints.
- Frontend: transcript panel with filters and export button.

### Phase 7 — Media & Export (SRS §3.7)
- Implement signed Cloudinary upload flow (server issues signed params; client uploads directly to Cloudinary).
- Implement board export to PNG/SVG/PDF, optionally stored via Cloudinary.

### Phase 8 — Dockerization & Deployment (SRS §7, Design §9)
- Write Dockerfiles for `backend` (multi-stage Gradle build → JRE runtime image) and `frontend` (Vite build → Nginx static serve).
- Finalize `docker-compose.yml` and an Nginx config that proxies `/api` → backend REST, `/ws` → backend WebSocket (preserving `Upgrade`/`Connection` headers), `/` → frontend.
- Add a GitHub Actions workflow: lint/test on PR, build & push Docker images to a registry on merge to `main`.

### Phase 9 — Hardening & NFRs (SRS §4)
- Add rate limiting on auth and summarization endpoints, input sanitization for user-rendered text, HTTPS/WSS enforcement notes for prod, health check endpoint via Actuator.
- Add unit/integration tests for RBAC enforcement, WS conflict resolution, and auth flows.

---

## OUTPUT EXPECTATIONS PER PHASE

For each phase, provide:
1. A short summary of what was implemented and which files were created/changed.
2. Any deviation from the SRS/Design Document, with justification, flagged explicitly.
3. How to run/test that phase locally (commands).
4. A list of open questions or assumptions made, if the spec was ambiguous.

Do not skip ahead to a later phase until the current phase is confirmed working. If a requirement in the SRS is unclear or conflicts with the Design Document, stop and ask rather than guessing.
