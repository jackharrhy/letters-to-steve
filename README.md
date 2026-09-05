# Letters to Steve

A small correspondence site built on the Remix 3 preview. Every letter goes to Steve's private inbox. Steve can reply privately, or group one or more permitted letters into a public answer.

## What is here

- A dedicated, distraction-free writing page
- A progressively enhanced Tiptap editor with restrained prose formatting
- Handwritten, book, and plain letter styles using self-hosted fonts
- Sharp-processed JPEG, PNG, and WebP attachments stored on local disk
- Explicit permission to publish a letter and its author's name
- An editorial inbox where nothing is public by default
- A protected `/steve` inbox using browser-native Basic authentication
- A persistent admin switch that closes every public route without taking the server offline
- Draft and published issues containing one or more letters and Steve's response
- Editable public copies that preserve the untouched original submissions
- Permanent public links for published issues
- Private email reply handoff, completion state, and archiving
- SQLite storage and SQL migrations through Remix data tables
- Boundary validation, a honeypot field, and same-origin checks on admin writes
- A simple light theme and responsive layout

The complete text-only public flow works without client JavaScript. Rich formatting and image
uploads enhance the same form when the browser runtime is available.

## Requirements

- Node.js 24.3 or newer
- npm 11 or newer

Remix 3 is currently a prerelease. This repository pins the generated release line in `package-lock.json`, but framework upgrades should still be reviewed and tested deliberately.

## Local setup

```sh
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:44100`. The development and production scripts load `.env` automatically.

Set a long random value for `STEVE_ADMIN_PASSWORD`, then visit `http://localhost:44100/steve`. Use `steve` as the username and the configured value as the password. Production deployments must serve the admin route over HTTPS because Basic authentication credentials are sent with each request.

## Commands

```sh
npm run dev        # development server with file watching
npm run hmr        # development server with Remix UI HMR
npm run start      # production-mode Node server
npm run typecheck  # TypeScript checks
npm test           # route and privacy regression test
npm run db:status  # inspect migrations
npm run db:migrate # apply pending migrations manually
```

The runtime applies pending migrations during startup. The manual database commands are useful for deployment checks and maintenance.

New databases begin with the public site closed. Sign in at `/steve` and use the public-site
switch when it is ready to open. Set `TRUST_PROXY=true` only when the Node server is reachable
exclusively through a trusted reverse proxy that overwrites forwarding headers.

## Data and configuration

The default database is `db/letters.sqlite`. Override it with `DATABASE_PATH`. Processed images are
stored in `tmp/uploads`; override that directory with `UPLOAD_DIRECTORY`. Both locations are ignored
by Git, while migration files under `db/migrations` are committed.

Incoming images are limited to 10 MiB each and converted to WebP at a maximum dimension of 2400 px.
The complete upload directory is capped at 500 MiB. Unclaimed draft uploads expire after 24 hours.

The current single-node SQLite setup is a good fit for a personal site. If the app grows into multiple server instances, move the same table contract to a shared PostgreSQL database before scaling horizontally.

## Route map

- `GET /` renders published issues and links to the writing and admin pages
- `GET /write` renders the letter composer
- `GET /letters/:issueId` renders one published issue
- `POST /letters` validates and stores a letter
- `POST /uploads` validates and prepares one draft image
- `GET /uploads/:attachmentId` streams one processed image
- `GET /steve` renders the protected inbox
- `POST /steve/site` opens or closes the public site
- `POST /steve/issues` drafts or publishes a grouped issue
- `POST /steve/issues/:issueId` saves, publishes, unpublishes, or discards an issue
- `POST /steve/letters/:letterId` archives, restores, or completes a private reply

Routes are defined once in `app/routes.ts` and referenced through typed `href()` helpers everywhere else.

## Design direction

The interface keeps the original project deliberately simple and restores its Steve artwork as the header. Its editorial model takes inspiration from reader-correspondence publications: submissions stay private until Steve deliberately shapes and publishes an answer.
