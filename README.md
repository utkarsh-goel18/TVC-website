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
npm run dev
```

Open http://localhost:3000.

## PRIMUS registration

All PRIMUS’26 participants, including TIET students and external participants, must register through the same official Saturnalia website: [Saturnalia business events](https://www.saturnalia.in/events/business). The TVC website provides event information and a link to that single registration destination. It does not host a registration form, create participant/team records, or collect/store registration data.

The former TVC-hosted PRIMUS registration system has been retired. Its Firestore registration records must be deleted separately from the Firebase console; removing the application code does not delete data already stored in Firestore.

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
