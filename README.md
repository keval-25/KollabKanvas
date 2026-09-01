# KollabKanvas — Production Collaborative Whiteboard Platform

[![CI/CD Pipeline](https://github.com/keval-25/KollabKanvas/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/keval-25/KollabKanvas/actions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**KollabKanvas** is an enterprise-grade, real-time collaborative whiteboard platform built with Spring Boot 3, MongoDB, Redis, React, TypeScript, RoughJS, and STOMP WebSockets.

---

## Key Features

- 🎨 **Real-Time Collaborative Drawing:** Multi-user sub-100ms drawing, shape creation, text notes, sticky notes, and smooth live cursor overlays powered by STOMP over WebSockets & Redis Pub/Sub.
- ⚡ **Optimistic Versioning & Conflict Resolution:** Per-element version tracking preventing lost updates and race conditions during high-frequency concurrent edits.
- 🔐 **JWT Authentication & Server-Side RBAC:** Fine-grained role permissions (`OWNER`, `EDITOR`, `COMMENTER`, `VIEWER`) enforced across both REST endpoints and STOMP message channels.
- 🤖 **AI Board Summarization:** Server-side LLM text extraction with version-snapshot hash caching to minimize external API costs.
- 📜 **Append-Only Action Transcripts:** Full chronological audit log tracking user drawing operations with CSV export capabilities.
- 🖼️ **Media Uploads & Export:** Cloudinary media integration with signed upload parameters, plus client-side PNG/PDF canvas export.
- 🐳 **Dockerized & Cloud Ready:** Production multi-stage Dockerfiles ready for deployment on Render and Vercel.

---

## Tech Stack

### Backend
- **Framework:** Spring Boot 3.3.4 (Java 17)
- **Database:** MongoDB
- **Caching & Pub/Sub:** Redis
- **Security:** Spring Security, JWT (JJWT), Rate-Limiting Filters
- **Real-Time:** Spring STOMP WebSocket Messaging

### Frontend
- **Framework:** React 18, Vite, TypeScript
- **State Management:** Zustand
- **Canvas Rendering:** RoughJS, HTML5 Canvas API
- **Icons & Styling:** Lucide React, Modern Glassmorphism CSS Design System
- **Networking:** Axios, @stomp/stompjs, SockJS

---

## Quick Start (Local Docker Compose)

```bash
# Clone the repository
git clone https://github.com/keval-25/KollabKanvas.git
cd KollabKanvas

# Launch complete stack (MongoDB, Redis, Backend, Frontend, Nginx Gateway)
docker-compose up -d --build
```

Visit `http://localhost` in your browser.

---

## Deployment Documentation

Detailed deployment guides for **Render** (Docker Web Service) and **Vercel** (React SPA) can be found in [`DEPLOYMENT.md`](file:///c:/CHECKOUTS/ksheth25-/KollabKanvas/DEPLOYMENT.md).

---

## License

MIT License. Developed for enterprise-grade collaborative productivity.
