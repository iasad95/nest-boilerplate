# NestJS API — portfolio

A compact, production-shaped [NestJS](https://nestjs.com/) API for my portfolio: validated configuration, PostgreSQL **or** MongoDB, JWT with role-based access, OpenAPI, health checks, rate limiting, and CI that runs the same Docker flows you can run locally.

---

## At a glance

| Topic | Details |
|-------|---------|
| **Runtime** | Node.js **16** ([`.nvmrc`](.nvmrc)), npm **8+** (`engines` in [`package.json`](package.json)) |
| **Framework** | NestJS **9.0.3**, TypeScript **4.7**, Jest **28** |
| **Data** | TypeORM **0.3.7** + PostgreSQL, or Mongoose **6** + MongoDB |
| **Security / API** | Helmet **5**, Passport JWT, URI versioning (`v1`), Swagger **6** at `/docs` (non-production) |
| **Ops** | Terminus **9**, `@nestjs/throttler` **v3** (global **200 req / 60s**; login **5 / 60s**), GitHub Actions |

---

## Table of contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [Configuration](#configuration)
5. [Scripts](#scripts)
6. [Database seeds](#database-seeds)
7. [HTTP API](#http-api)
8. [Docker E2E](#docker-e2e)
9. [Project layout](#project-layout)
10. [Develop and verify](#develop-and-verify)
11. [CI](#ci)

---

## Features

- **Config:** `@nestjs/config` with typed factories and `class-validator` on env-backed settings.
- **Persistence:** Flip `DATABASE_TYPE` for relational vs document; users go through a repository-style layer.
- **Auth:** JWT, `admin` / `user` roles, global JWT guard, `@Public()` to opt out.
- **HTTP:** Global `ValidationPipe`, optional CORS from `CORS_ORIGIN`, Helmet on every request.
- **Rate limits:** Throttler v3 uses **`ttl` in seconds** — app-wide window matches the table above; login uses `@Throttle(5, 60)`.
- **Observability:** Terminus checks (memory heap, disk), structured logging hook-up in `main.ts`.

Compose files use current PostgreSQL and MongoDB images for CI and local E2E runs.

---

## Prerequisites

- **Node.js 16.x** — use `nvm use` if you rely on [`.nvmrc`](.nvmrc) (`16.20.2`).
- **npm 8+**
- **Docker** — only for [Docker E2E](#docker-e2e) below.

---

## Quick start

```bash
npm install
cp env-example-relational .env   # PostgreSQL + TypeORM
# cp env-example-document .env   # MongoDB + Mongoose
npm run start:dev
```

With the sample env, the server listens on **port 3000**.

| What | URL |
|------|-----|
| Root health (no API prefix) | [http://localhost:3000/](http://localhost:3000/) |
| Swagger | [http://localhost:3000/docs](http://localhost:3000/docs) |

Sanity check:

```bash
curl -s http://localhost:3000/
```

Expect JSON including `status: ok`.

---

## Configuration

Copy the template that matches your database to `.env`, then **rotate secrets** (`AUTH_JWT_SECRET`, `SEED_USER_PASSWORD`, DB passwords) before any shared environment.

| File | Use case |
|------|----------|
| [`env-example-relational`](env-example-relational) | PostgreSQL + TypeORM |
| [`env-example-document`](env-example-document) | MongoDB + Mongoose |

### Core variables

| Variable | Role |
|----------|------|
| `NODE_ENV` | `development` or `production` (Swagger disabled in production) |
| `APP_PORT` | HTTP listen port |
| `API_PREFIX` | Global prefix (e.g. `api`). **`GET /` is excluded** so you keep a bare root health check |
| `CORS_ORIGIN` | CORS origin(s); `*` is fine for local experiments |
| `SEED_USER_PASSWORD` | Password used when running seed scripts |
| `AUTH_JWT_SECRET` | JWT signing secret (examples enforce **≥ 32** characters) |
| `AUTH_JWT_TOKEN_EXPIRES_IN` | Token TTL (e.g. `1d`) |

### Database

- **Relational:** set `DATABASE_TYPE` and host, port, credentials, database name; optional `DATABASE_SYNCHRONIZE`, `DATABASE_URL`.
- **Document:** set Mongo-related fields per the document example, including `DATABASE_URL`.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Dev server with watch |
| `npm run start:debug` | Dev server with debugger |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run build` | Compile to `dist/` |
| `npm run format` | Prettier on `src/` and `test/` |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |
| `npm run test:watch` | Jest watch mode |
| `npm run test:cov` | Jest with coverage |
| `npm run seed:run:relational` | Seed PostgreSQL |
| `npm run seed:run:document` | Seed MongoDB |
| `npm run migration:generate` | Generate TypeORM migration |
| `npm run migration:run` / `npm run migration:revert` | Apply or revert migrations |

---

## Database seeds

```bash
npm run seed:run:relational
# or
npm run seed:run:document
```

Seeded accounts use `SEED_USER_PASSWORD` from `.env` (examples use `ChangeMe_BeforeSeeding!` until you change it).

| Role | Email |
|------|-------|
| Admin | `admin@example.com` |
| User | `user@example.com` |

---

## HTTP API

Assume `APP_PORT=3000` and `API_PREFIX=api`.

| Endpoint | Description |
|----------|-------------|
| `GET /` | Minimal health JSON (outside prefix) |
| `GET /api/v1/health` | Terminus (heap + disk) |
| `POST /api/v1/auth/email/login` | Login (stricter throttle) |
| `GET /api/v1/auth/me` | Current user — header `Authorization: Bearer <jwt>` |
| `GET /api/v1/users` | Paginated list — **admin** |
| `POST /api/v1/users` | Create user — **admin** |
| `GET /docs` | Swagger UI when not in production |

---

## Docker E2E

Same compose definitions as CI: build images, then **relational** flow runs TypeORM **migrations** and seeds (document mode only seeds), then `start:prod`, lint, and HTTP smoke tests — see [`startup.relational.ci.sh`](startup.relational.ci.sh) and [`startup.document.ci.sh`](startup.document.ci.sh). Requires the Docker daemon.

**PostgreSQL**

```bash
docker compose -f docker-compose.relational.ci.yaml --env-file env-example-relational up --build --exit-code-from api
```

**MongoDB**

```bash
docker compose -f docker-compose.document.ci.yaml --env-file env-example-document up --build --exit-code-from api
```

CI uses `-p ci-relational` / `-p ci-document` to avoid project name clashes; add the same `-p` locally if you run both stacks on one machine.

---

## Project layout

```
src/
├── auth/           # Login, JWT strategies
├── users/          # REST + relational / document persistence
├── health/         # Terminus controller
├── database/       # DataSource, migrations, seeds
├── config/         # App config types and loading
├── roles/          # RBAC decorators and guard
└── common/         # Guards, filters, logging, DTOs, middleware
```

[`src/main.ts`](src/main.ts) registers the global prefix (with `/` excluded), URI versioning, Swagger, Helmet, and pipes.

---

## Develop and verify

```bash
nvm use                    # optional; reads .nvmrc
rm -rf node_modules && npm ci
npm run build && npm run lint && npm test && npm run test:cov
```

**Node version:** [`package.json`](package.json) declares Node **16** in `engines`. Running `npm ci` on a newer Node version may show **`EBADENGINE`**; installs still succeed unless `engine-strict` is enabled. CI uses Node 16.

**Tests:** Specs live as `*.spec.ts` beside sources; shared Jest setup is [`test/setup-tests.ts`](test/setup-tests.ts).

---

## CI

Workflow: [`.github/workflows/docker-e2e.yml`](.github/workflows/docker-e2e.yml)

| Job | Steps |
|-----|--------|
| **verify** | `npm ci`, `npm run build`, `npm run lint` on Node 16 |
| **e2e** | Matrix over **relational** and **document** Docker Compose (build, seed, `start:prod`, lint, HTTP checks) |

Runs on **pull_request** to **`main`** and **`master`** (not on direct pushes).
