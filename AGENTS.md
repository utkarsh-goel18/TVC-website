# Repository instructions

## Project context

This is the official, long-lived website for Thapar Venture Club (TVC), Thapar Institute of Engineering & Technology. It includes public club/event pages and the PRIMUS'26 student-registration system.

Before making a change, inspect the relevant page, component, route, data source and existing styles. Read [`README.md`](README.md) for setup and the relevant topic document below:
- Visual design and motion: `design.md`
- Content and media: `content-and-assets.md`
- PRIMUS backend: `PRIMUS-REGISTRATION-BACKEND.md`
- QA: `acceptance-criteria.md`

## Design principles

- Maintain the premium, editorial TVC identity: near-black and warm-white foundations, restrained TVC-yellow accents, strong typography and intentional whitespace.
- Use real TVC photography and approved identities. Do not substitute fabricated people, statistics or testimonials.
- Preserve supplied logo artwork. Do not redraw, recolour, distort or stretch it.
- Motion must support the story, not obstruct it. Respect `prefers-reduced-motion`, keep native scrolling, and provide usable touch and keyboard states.
- Avoid generic college templates, excessive gradients, glassmorphism, floating blobs, over-rounded cards and decorative animation without purpose.

## Engineering rules

- Implement the requested scope only; do not refactor unrelated pages as collateral work.
- Prefer reusable, typed components and data-driven content where appropriate.
- Keep route structure, navigation and metadata consistent with the actual App Router implementation.
- Do not add dependencies unless they materially improve the result.
- Do not weaken authentication, authorisation, validation, rate limits, Firestore rules or privacy protections to make a feature easier.
- Keep Firebase Admin SDK credentials and admin allowlists server-only.
- Never log or commit participant personal data, tokens, private keys, local database dumps or exports.
- Do not delete, replace or bulk-optimise original photos/videos without explicit approval. If performance work is needed, create and verify derivatives while retaining originals.

## Verification

Before reporting completion:
1. Run `npm run typecheck`.
2. Run relevant lint checks and report pre-existing unrelated findings honestly.
3. Run `npm run build` for changes that affect application code/configuration.
4. For UI changes, inspect desktop and mobile layouts, navigation, scroll up/down, keyboard focus and reduced-motion behaviour.
5. For PRIMUS changes, test participant and admin flows with test accounts and a non-production Firebase project where possible.
6. Report changed files, checks run, and remaining risks. Never claim production deployment or live Firebase configuration has been verified unless it has.
