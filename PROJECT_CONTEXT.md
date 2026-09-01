# KollabKanvas — Complete Project Context & Handover Summary

This document serves as the persistent, complete context summary for **KollabKanvas** to enable seamless continuation in future sessions.

---

## 1. Project Identity & Repository Overview

- **Project Name:** KollabKanvas
- **Workspace Directory:** `c:\CHECKOUTS\ksheth25-\KollabKanvas`
- **Git Repository:** `https://github.com/keval-25/KollabKanvas.git`
- **Active Core Branches:**
  - `main` (Production release branch — fully tested & merged)
  - `develop` (Staging/Integration branch — all phase branches merged here first)

---

## 2. Completed Phase-by-Phase Implementation Log

All 10 implementation phases specified in SRS and Design documents have been fully built, tested (`./gradlew test` and `npm run build`), committed to individual feature branches, pushed to remote `origin`, and merged into `develop` and `main`:

| Phase | Description & Features Built | Feature Branch Name | Git Merge Status |
|---|---|---|---|
| **Phase 0** | **Foundation Setup:** Spring Boot 3.3.4, Java 17, Gradle 8.6, React 18, Vite, TypeScript, Zustand, and Glassmorphism CSS design system. | `feature/phase-0-foundation` | Merged into `develop` & `main` |
| **Phase 1** | **Auth & User Management:** User entity, UserRepository, JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig, AuthService, AuthController, LoginPage, RegisterPage. | `feature/phase-1-auth` | Merged into `develop` & `main` |
| **Phase 2** | **Board Management & CRUD:** Board model, BoardRepository, BoardService (create, get, list, update, delete, duplicate, template initialization), BoardController, DashboardPage. | `feature/phase-2-board-crud` | Merged into `develop` & `main` |
| **Phase 3** | **Real-Time Collaborative Drawing:** STOMP WebSocketConfig, RedisConfig, RedisPublisher, ConflictResolutionService (optimistic versioning), WebSocketController, CanvasRenderer (RoughJS engine), CursorLayer, useWebSocket, useBoardStore. | `feature/phase-3-realtime-drawing` | Merged into `develop` & `main` |
| **Phase 4** | **Server & Client RBAC:** Roles (`OWNER`, `EDITOR`, `COMMENTER`, `VIEWER`), BoardSecurityService, WebSocketChannelInterceptor (drops unauthorized edit frames server-side), collaborator endpoints, ShareModal. | `feature/phase-4-rbac` | Merged into `develop` & `main` |
| **Phase 5** | **AI Board Summarization:** Summary model, SummaryRepository, AiSummaryService (text extraction, structured prompts, version-snapshot caching, Anthropic LLM REST call & fallback), SummaryPanel drawer. | `feature/phase-5-ai-summary` | Merged into `develop` & `main` |
| **Phase 6** | **Action Transcripts:** Transcript model, TranscriptRepository, TranscriptService (append-only audit log, user/action filtering, CSV generator), TranscriptPanel drawer, CSV export endpoint. | `feature/phase-6-transcript` | Merged into `develop` & `main` |
| **Phase 7** | **Media Uploads & Canvas Export:** CloudinaryService (signed parameter generation for secure direct client uploads), MediaController, exportBoard module (PNG & PDF export), toolbar export triggers. | `feature/phase-7-media-export` | Merged into `develop` & `main` |
| **Phase 8** | **Dockerization & CI/CD:** Multi-stage Dockerfiles for backend (Temurin JDK 17 -> JRE 17) and frontend (Node Alpine -> Nginx Alpine), Nginx SPA routing config, GitHub Actions CI/CD workflow (`ci-cd.yml`). | `feature/phase-8-dockerization-ci` | Merged into `develop` & `main` |
| **Phase 9** | **Hardening & NFRs:** RateLimitingFilter (IP-based limit for Auth & AI endpoints), SanitizationUtils (XSS protection), AuthControllerTest integration tests. | `feature/phase-9-hardening` | Merged into `develop` & `main` |

---

## 3. Technology Stack & Key Architecture

### Backend Stack
- **Framework:** Spring Boot 3.3.4 (Java 17)
- **Database:** MongoDB (`data-mongodb`)
- **Messaging & Cache:** Redis (`data-redis`) for Pub/Sub WS fan-out
- **Real-Time Messaging:** Spring STOMP over WebSockets (`/ws`)
- **Security:** Spring Security, JWT (`jjwt-api` 0.12.5), Rate-Limiting Filters
- **Build System:** Gradle 8.6 (Wrapper configured to local cache `gradle-8.6-bin.zip`)

### Frontend Stack
- **Framework:** React 18 + Vite + TypeScript
- **State Management:** Zustand (`useAuthStore`, `useBoardStore`)
- **Canvas Engine:** RoughJS + HTML5 Canvas API
- **Icons & Styling:** Lucide React + HSL CSS Custom Tokens + Glassmorphism UI
- **Networking:** Axios (with 401 JWT refresh interceptor) + `@stomp/stompjs` + `sockjs-client`
- **PDF & Canvas Export:** `jspdf` + `html2canvas`

---

## 4. Key Configuration Files & Entry Points

- **Backend Entry Point:** [`KanvasApplication.java`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/backend/src/main/java/com/kolab/kanvas/KanvasApplication.java)
- **Security & JWT Configuration:** [`SecurityConfig.java`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/backend/src/main/java/com/kolab/kanvas/security/SecurityConfig.java)
- **WebSocket Broker Config:** [`WebSocketConfig.java`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/backend/src/main/java/com/kolab/kanvas/config/WebSocketConfig.java)
- **Frontend App Router:** [`App.tsx`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/frontend/src/App.tsx)
- **Global CSS Design System:** [`index.css`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/frontend/src/index.css)
- **Deployment Documentation:** [`DEPLOYMENT.md`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/DEPLOYMENT.md)
- **Docker Compose:** [`docker-compose.yml`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/docker-compose.yml)
- **CI/CD Workflow:** [`.github/workflows/ci-cd.yml`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/.github/workflows/ci-cd.yml)

---

## 5. Local Execution Commands

### Docker Compose (Single-Command)
```powershell
cd c:\CHECKOUTS\ksheth25-\KollabKanvas
docker-compose up -d --build
# Access UI at http://localhost
```

### Manual Development Terminals
- **Backend:** `cd backend && .\gradlew.bat bootRun` (Port 8080)
- **Frontend:** `cd frontend && npm run dev` (Port 5173)
- **Backend Tests:** `cd backend && .\gradlew.bat test`
- **Frontend Build:** `cd frontend && npm run build`
