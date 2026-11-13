# Thapar Venture Club Website

The official website for Thapar Venture Club (TVC), Thapar Institute of Engineering & Technology.

## What is in this repository

- Public TVC website: homepage, events, E-Summit, TVC x SAT / PRIMUS, speakers and team pages.
- Public PRIMUS’26 event information with registration directed to the official Saturnalia website.

## Technology

- Next.js 15 App Router, React 19 and TypeScript
- Tailwind CSS 4
- GSAP and Lenis for motion and scrolling
- Firebase App Hosting configuration

## Local development

Requirements: a Node.js version supported by the installed Next.js release and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Set the environment variables described in [`.env.example`](.env.example). The Firebase client configuration is in `src/lib/primus/firebase-client.ts`; server-side credentials are read by `src/lib/primus/firebase-admin.ts`. Never expose Admin SDK credentials through a `NEXT_PUBLIC_` variable or commit `.env.local`.

## PRIMUS registration

All PRIMUS’26 participants, including TIET students, must register through the official Saturnalia website: [Saturnalia business events](https://www.saturnalia.in/events/business). The TVC website provides event information and links to that single registration destination; it does not collect or store participant registrations.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

The full-repository lint command may report existing findings outside recently changed files. Do not treat a successful production build as proof that all lint rules pass; review each command's output.

## Documentation map

- [`AGENTS.md`](AGENTS.md) — repository-specific implementation and review rules
- [`design.md`](design.md) — current visual direction, page experience and motion principles
- [`content-and-assets.md`](content-and-assets.md) — content approval and media requirements
- [`acceptance-criteria.md`](acceptance-criteria.md) — ongoing QA and launch checklist

## Content integrity

Publish only information approved by TVC. Do not invent speaker names, team members, sponsors, event dates, statistics, achievements, venue details or registration URLs.
