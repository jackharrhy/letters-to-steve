# Letters to Steve

A small correspondence site built on the Remix 3 preview. Visitors write on a card, choose whether the note is public or private, and can leave an email address for a private reply. Steve gets a password-protected inbox where he can publish a reply beneath a public letter or open a private email response.

## What is here

- A server-rendered letter composer with four paper designs
- Public and private letter visibility
- A public letter wall that never includes private notes or email addresses
- A protected `/steve` inbox using browser-native Basic authentication
- Public replies stored and shown beneath the original letter
- Private replies handed off through an email link
- SQLite storage and SQL migrations through Remix data tables
- Boundary validation, a honeypot field, and same-origin checks on admin writes
- Light and dark themes, reduced-motion handling, and responsive layouts

The paper picker uses native radio controls and CSS, so the complete public flow works without client JavaScript.

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

## Data and configuration

The default database is `db/letters.sqlite`. Override it with `DATABASE_PATH`. SQLite files and sidecar files are ignored by Git; migration files under `db/migrations` are committed.

The current single-node SQLite setup is a good fit for a personal site. If the app grows into multiple server instances, move the same table contract to a shared PostgreSQL database before scaling horizontally.

## Route map

- `GET /` renders the composer and public wall
- `POST /letters` validates and stores a letter
- `GET /steve` renders the protected inbox
- `POST /steve/letters/:letterId/reply` publishes or updates a public reply

Routes are defined once in `app/routes.ts` and referenced through typed `href()` helpers everywhere else.

## Design direction

The interaction takes inspiration from the tactile card composer at [ky.fyi/guestbook](https://ky.fyi/guestbook), but the visual system, assets, copy, and implementation here are original. The correspondence-desk image was generated specifically for this project, and the included Manrope and IBM Plex Mono font files are locally hosted.
