# Thapar Venture Club Website

The official website for Thapar Venture Club (TVC), Thapar Institute of Engineering & Technology.

## Stack

- Next.js 15 App Router and React 19
- TypeScript
- Tailwind CSS 4
- GSAP and Lenis for motion and scroll experiences
- Firebase Authentication and Cloud Firestore for PRIMUS registration
- Firebase Admin SDK for trusted server-side registration and admin operations
- Firebase App Hosting for deployment

## Local development

Requirements: Node.js compatible with the project and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The public Firebase client configuration is defined in `src/lib/primus/firebase-client.ts`. Server-side Firebase Admin configuration is read from environment variables. For local development, set the values documented in `.env.example` in `.env.local`.

## PRIMUS registration

The PRIMUS registration flow is available at `/events/tvc-x-sat/register`. It uses Firebase Authentication for verified Thapar student accounts and Firestore for team registration.

The admin dashboard is available at `/admin/primus`. Access is restricted by Firebase Auth UID using the server-side `PRIMUS_ADMIN_UIDS` environment variable. Use UIDs, not email addresses.

Firestore rules intentionally deny direct client reads and writes. Registration and admin data access is performed by the server through the Firebase Admin SDK. Required composite indexes are maintained in `firestore.indexes.json`.

Deploy Firestore configuration deliberately:

```bash
firebase deploy --only firestore:indexes --project tvc-primus-2026
firebase deploy --only firestore:rules --project tvc-primus-2026
```

Do not deploy rules or indexes to a different Firebase project without reviewing the target first.

## Environment variables

See `.env.example` for the required local/server configuration. Never commit `.env.local`, service-account private keys, admin credentials, participant exports, or production data.

Firebase App Hosting uses Application Default Credentials for the Admin SDK when explicit service-account credentials are not supplied. Configure `PRIMUS_ADMIN_UIDS` in the production App Hosting environment before exposing the admin dashboard.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The repository may contain documented lint findings in legacy files; review the command output rather than treating a successful build as proof that every lint rule passes.

## Project documentation

- `design.md` — visual system and design principles
- `implementation-plan.md` — implementation phases and technical approach
- `information-architecture.md` — routes and page structure
- `motion-spec.md` — animation and interaction behaviour
- `content-and-assets.md` — content and asset inventory
- `acceptance-criteria.md` — quality and launch checklist
- `PRIMUS-REGISTRATION-BACKEND.md` — registration backend and data model notes

## Content integrity

Do not invent speaker names, team members, sponsors, event dates, statistics, achievements, venue details, or registration URLs. Confirm content with TVC before publishing.
