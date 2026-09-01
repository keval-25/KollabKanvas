# Software Requirements Specification (SRS)
## Real-Time Interactive Whiteboard Application

**Version:** 1.0
**Date:** August 13, 2026
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for a **Real-Time Interactive Whiteboard Application** — a collaborative, browser-based drawing and ideation tool (similar in UX to Excalidraw) that supports multi-user real-time sync, AI-powered board summarization, session transcripts, and role-based access control. It is intended for use by the development team, QA, DevOps, and project stakeholders as the single source of truth for what the system must do.

### 1.2 Scope
The product, referred to as **CollabBoard**, will allow registered users to:
- Create, edit, and share digital whiteboards in real time with multiple simultaneous collaborators.
- Draw shapes, freehand strokes, text, sticky notes, and connectors on an infinite canvas.
- See other users' cursors, selections, and edits live via WebSockets.
- Generate an AI-powered summary of a board's content (shapes, text, sticky notes) on demand.
- Maintain a transcript of actions/comments per user for auditability and session recap.
- Assign roles (Owner, Editor, Viewer, Commenter) per board to control editing/sharing rights.
- Export/import boards and store media assets (images, exported snapshots) via Cloudinary.
- Run the entire stack in Docker containers and deploy it to a live server.

Out of scope for v1: native mobile apps, offline-first conflict-free editing across long disconnects (basic reconnection sync only), video/audio conferencing.

### 1.3 Intended Audience
Backend engineers (Spring Boot), frontend engineers (ReactJS), DevOps engineers, QA/testers, product owner, and future maintainers.

### 1.4 Definitions, Acronyms, Abbreviations
| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| WS | WebSocket |
| RBAC | Role-Based Access Control |
| CRDT | Conflict-free Replicated Data Type |
| OT | Operational Transformation |
| JWT | JSON Web Token |
| STOMP | Simple Text Oriented Messaging Protocol (used over WS in Spring) |
| Board | A single whiteboard canvas/document |
| Element | Any drawable object on a board (shape, stroke, text, note, image) |

### 1.5 References
- IEEE 830-1998 SRS template (structure basis)
- Excalidraw (UI/UX reference)
- Spring Boot WebSocket / STOMP documentation
- Cloudinary API documentation
- MongoDB / PostgreSQL documentation

### 1.6 Overview
Section 2 gives an overall product description. Section 3 lists detailed functional requirements. Section 4 covers non-functional requirements. Section 5 covers external interface requirements. Section 6 covers system features as use cases. Section 7 covers deployment/Docker-specific requirements.

---

## 2. Overall Description

### 2.1 Product Perspective
CollabBoard is a new, standalone, greenfield web application. It is a three-tier system:
1. **Client (ReactJS SPA)** — renders the canvas, handles local drawing state, and communicates with the backend via REST (for CRUD) and WebSockets (for real-time sync).
2. **Backend (Java Spring Boot)** — exposes REST APIs, manages WebSocket sessions/broadcast, enforces RBAC, orchestrates AI summarization calls, and persists data.
3. **Data & Infra layer** — MongoDB or SQL (PostgreSQL) for persistent storage, Cloudinary for media/asset storage, and an AI provider (e.g., Anthropic/OpenAI API) for summarization.

### 2.2 Product Functions (Summary)
- User authentication & authorization (JWT-based)
- Board creation, listing, deletion, renaming
- Real-time collaborative drawing (shapes, freehand, text, sticky notes, connectors, images)
- Live cursor/presence indicators
- Role-based board sharing (Owner / Editor / Commenter / Viewer)
- AI-generated board summary (on-demand and optionally periodic)
- Per-user action/comment transcript with timestamped history
- Undo/redo (local and collaborative-aware)
- Export board as PNG/SVG/PDF, stored via Cloudinary
- Dockerized deployment with CI/CD to a live server

### 2.3 User Classes and Characteristics
| User Class | Description | Technical Proficiency |
|---|---|---|
| Board Owner | Creates boards, manages roles, deletes board | Low–Medium |
| Editor | Can draw/edit content, cannot manage roles | Low |
| Commenter | Can add comments/sticky notes only, cannot edit shapes | Low |
| Viewer | Read-only, sees live updates | Low |
| System Admin | Manages users, monitors system health, moderates content | High |

### 2.4 Operating Environment
- **Client:** Modern evergreen browsers (Chrome, Edge, Firefox, Safari) supporting WebSocket, Canvas/SVG rendering, ES2020+.
- **Server:** Java 17+ / Spring Boot 3.x, running inside Docker containers on Linux (Ubuntu-based images), deployed to a cloud VM or container platform (e.g., AWS EC2/ECS, Render, DigitalOcean).
- **Database:** MongoDB Atlas or self-hosted PostgreSQL, containerized or managed.
- **CDN/Media:** Cloudinary for image/export storage.

### 2.5 Design and Implementation Constraints
- Backend must be implemented in Java using Spring Boot.
- Real-time sync must use WebSockets (STOMP over SockJS or raw WS).
- Must be containerized with Docker and orchestrated via `docker-compose` (single-host) with a path to Kubernetes for future scale.
- Version control and CI/CD via GitHub (GitHub Actions).
- Must support at least MongoDB OR a relational SQL database — schema design should be provided for both, with one selected as primary.

### 2.6 Assumptions and Dependencies
- Users have stable internet connectivity for real-time features to function well.
- Third-party AI API availability and rate limits are assumed sufficient for summarization needs.
- Cloudinary free/paid tier is available for asset storage.
- Browser supports HTML5 Canvas/SVG and WebSocket APIs.

---

## 3. Specific Requirements — Functional

### 3.1 Authentication & User Management
- **FR-1.1:** The system shall allow users to register with email/password or OAuth (Google).
- **FR-1.2:** The system shall issue JWT access + refresh tokens upon successful login.
- **FR-1.3:** The system shall allow password reset via email verification link.
- **FR-1.4:** The system shall allow users to update profile (name, avatar).
- **FR-1.5:** The system shall invalidate/blacklist tokens on logout.

### 3.2 Board Management
- **FR-2.1:** Users shall be able to create a new board with a name and optional template.
- **FR-2.2:** Users shall be able to list all boards they own or have access to, sorted by last modified.
- **FR-2.3:** Board Owners shall be able to rename, duplicate, archive, or permanently delete a board.
- **FR-2.4:** The system shall autosave board state periodically and on every significant change.
- **FR-2.5:** Users shall be able to search boards by name/tag.

### 3.3 Real-Time Collaborative Drawing
- **FR-3.1:** The system shall broadcast every drawing action (create/update/move/delete element) to all connected clients on the same board within 200ms under normal network conditions.
- **FR-3.2:** The system shall support concurrent editing by multiple users without overwriting each other's changes (via OT/CRDT-based or last-write-wins-with-versioning strategy — see Design Document §8).
- **FR-3.3:** The system shall show live cursors with user name/color for each connected participant.
- **FR-3.4:** The system shall show a presence list of currently active users on a board.
- **FR-3.5:** The system shall support drawing primitives: freehand pen, rectangle, ellipse, arrow/line, text box, sticky note, and image insertion — matching an Excalidraw-like toolset.
- **FR-3.6:** The system shall support element operations: select, move, resize, rotate, delete, group/ungroup, layer (z-index) reorder, color/stroke style changes.
- **FR-3.7:** The system shall support undo/redo, scoped per-user but reconciled with the shared board state.
- **FR-3.8:** The system shall handle client reconnection by resyncing the full/delta board state after a dropped connection.

### 3.4 AI-Based Board Summarization
- **FR-4.1:** Users with Editor/Owner/Commenter role shall be able to trigger "Summarize Board" on demand.
- **FR-4.2:** The system shall extract text content (text elements, sticky notes, comments) and structural metadata (shape counts, groupings) from the board and send it to an AI summarization service.
- **FR-4.3:** The system shall display the generated summary (key points, action items, themes) in a side panel, and allow exporting it as text/PDF.
- **FR-4.4:** The system shall cache the last generated summary and show a "regenerate" option, timestamped.
- **FR-4.5 (optional/stretch):** The system may auto-generate a summary at the end of a live session when the last participant disconnects.

### 3.5 Transcript per User
- **FR-5.1:** The system shall log a chronological transcript of each user's actions on a board (element added/edited/deleted, comment added, role changed) with timestamps.
- **FR-5.2:** The system shall allow filtering the transcript by user, action type, and time range.
- **FR-5.3:** Board Owners/Editors shall be able to export the transcript as CSV/PDF.
- **FR-5.4:** The system shall retain transcripts for a configurable retention period (default 90 days).

### 3.6 Role-Based Access Control (RBAC)
- **FR-6.1:** The Board Owner shall be able to invite users via email or shareable link, assigning a role: Owner, Editor, Commenter, or Viewer.
- **FR-6.2:** The system shall enforce role permissions at both the API layer and WebSocket message-handling layer (server-side authoritative checks, not client-trust).
- **FR-6.3:** The Owner shall be able to change or revoke a collaborator's role/access at any time, effective immediately (including force-disconnecting active WS sessions if access is revoked).
- **FR-6.4:** The system shall support link-based sharing with configurable default role and optional expiry/password.
- **FR-6.5:** Viewers shall receive real-time updates but shall not be able to send edit actions (enforced server-side).

### 3.7 Media & Export
- **FR-7.1:** Users shall be able to upload images to the canvas, stored via Cloudinary, with a client-side size/type validation.
- **FR-7.2:** Users shall be able to export the board as PNG, SVG, or PDF.
- **FR-7.3:** Exported files shall optionally be stored in Cloudinary and shareable via a signed URL.

### 3.8 Notifications
- **FR-8.1:** The system shall notify users (in-app and optionally email) when invited to a board or when their role changes.
- **FR-8.2:** The system shall show a toast/notification when a collaborator joins or leaves a board session.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-1.1:** WebSocket message round-trip (draw action → broadcast to peers) shall not exceed 200ms at the 95th percentile under normal load (≤50 concurrent users per board).
- **NFR-1.2:** REST API responses shall return within 500ms at the 95th percentile for standard CRUD operations.
- **NFR-1.3:** The system shall support at least 20 concurrent boards with up to 25 simultaneous editors each on a single backend instance before requiring horizontal scaling.

### 4.2 Scalability
- **NFR-2.1:** The backend shall be stateless where possible, with WebSocket session/broadcast state shareable across instances via a message broker (e.g., Redis Pub/Sub or RabbitMQ) to support horizontal scaling.
- **NFR-2.2:** The database schema shall support sharding/partitioning by board ID for future scale-out.

### 4.3 Security
- **NFR-3.1:** All traffic shall be served over HTTPS/WSS in production.
- **NFR-3.2:** Passwords shall be hashed with bcrypt/Argon2; never stored in plaintext.
- **NFR-3.3:** JWTs shall have short expiry (access token ≤15 min) with refresh token rotation.
- **NFR-3.4:** All authorization checks shall be enforced server-side; the client shall never be trusted for role enforcement.
- **NFR-3.5:** Input shall be validated/sanitized on both client and server to prevent XSS/injection, especially for text elements and comments rendered from user input.
- **NFR-3.6:** Rate limiting shall be applied to auth endpoints and AI summarization endpoint to prevent abuse.

### 4.4 Availability & Reliability
- **NFR-4.1:** Target uptime of 99.5% for the production deployment.
- **NFR-4.2:** The system shall gracefully degrade: if the AI service is unavailable, board editing/collaboration shall remain unaffected; only summarization is disabled with a clear error state.
- **NFR-4.3:** Board state shall be durably persisted; no data loss on server restart (WS reconnection triggers resync from DB).

### 4.5 Usability
- **NFR-5.1:** The UI shall closely mirror Excalidraw's minimal, hand-drawn aesthetic and toolbar layout for familiarity.
- **NFR-5.2:** The application shall be responsive down to tablet width (≥768px); full drawing support optimized for desktop.
- **NFR-5.3:** Core actions (draw, select, undo) shall be reachable via both mouse/touch and keyboard shortcuts.

### 4.6 Maintainability & Portability
- **NFR-6.1:** The backend shall follow a layered architecture (Controller → Service → Repository) with clear separation of concerns.
- **NFR-6.2:** The entire application (frontend, backend, DB) shall be Dockerized with a `docker-compose.yml` enabling one-command local spin-up.
- **NFR-6.3:** CI/CD via GitHub Actions shall run tests and build/push Docker images on merge to main.

### 4.7 Auditability
- **NFR-7.1:** All role changes, board deletions, and access revocations shall be logged with actor, timestamp, and action for audit purposes (distinct from the user-facing transcript).

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Landing/auth pages (login, register, forgot password).
- Dashboard: board list, create-new-board, search/filter.
- Board editor: infinite canvas, left toolbar (tools), right panel (properties, AI summary, transcript), top bar (board name, share/roles, presence avatars, export).
- Share/role management modal.

### 5.2 Hardware Interfaces
None beyond standard client devices (desktop/laptop primarily; keyboard, mouse/trackpad, optional touch/stylus).

### 5.3 Software Interfaces
- **Cloudinary API** — image/asset upload and delivery (REST, signed uploads).
- **AI Provider API** (e.g., Anthropic Claude API) — board summarization via text completion endpoint.
- **MongoDB/PostgreSQL** — persistence layer via Spring Data.
- **GitHub / GitHub Actions** — source control and CI/CD.
- **Docker Engine / Docker Hub** — containerization and image registry.

### 5.4 Communication Interfaces
- **REST/HTTPS** for CRUD operations (auth, board metadata, role management, transcript export).
- **WebSocket (WSS) with STOMP over SockJS** for real-time drawing sync, presence, and cursor broadcast.
- **SMTP** (e.g., via SendGrid) for email notifications and invites.

---

## 6. System Features (Use Case Summaries)

| ID | Use Case | Primary Actor | Summary |
|---|---|---|---|
| UC-1 | Register/Login | User | User creates account or logs in, receives JWT |
| UC-2 | Create Board | Owner | User creates a new whiteboard |
| UC-3 | Invite Collaborator | Owner | Owner shares board with a role assignment |
| UC-4 | Real-Time Draw | Editor | User draws; changes sync live to all participants |
| UC-5 | Change Role | Owner | Owner updates/revokes a collaborator's role |
| UC-6 | Summarize Board | Editor/Owner | User requests AI summary of board content |
| UC-7 | View Transcript | Editor/Owner | User views/filters/exports session transcript |
| UC-8 | Export Board | Any (role-permitting) | User exports board as image/PDF via Cloudinary |
| UC-9 | Reconnect & Resync | Any | Client reconnects after network drop and resyncs state |

---

## 7. Deployment & Operational Requirements

- **DR-1:** The application shall be packaged as independent Docker images: `frontend`, `backend`, and (if self-hosted) `database`, orchestrated via `docker-compose.yml` for local/staging and adaptable to Kubernetes/ECS for production.
- **DR-2:** Environment-specific configuration (API keys, DB URIs, JWT secrets, Cloudinary credentials) shall be injected via environment variables / secrets manager — never hardcoded.
- **DR-3:** A CI/CD pipeline (GitHub Actions) shall lint, test, build, and push images on merge, with a deploy step to the target server/platform.
- **DR-4:** The production deployment shall be fronted by a reverse proxy (e.g., Nginx) handling TLS termination and routing to frontend/backend/WS endpoints.
- **DR-5:** Logs and basic metrics (request latency, WS connection count, error rate) shall be collected for monitoring.

---

## 8. Appendix

### 8.1 Acceptance Criteria Summary
The system is considered v1-complete when: multi-user real-time drawing works reliably across 2+ browser sessions, RBAC is enforced server-side, AI summarization returns a usable summary within 10s for a typical board, transcripts are viewable/exportable per board, and the full stack runs via `docker-compose up` and is reachable on a live deployed URL.

### 8.2 Future Enhancements (Out of Scope v1)
- Offline-first editing with CRDT-based conflict resolution across long disconnects.
- Voice/video huddle integration.
- Mobile native apps.
- Version history/time-travel playback of board evolution.
