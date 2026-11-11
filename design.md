# TVC Website — Design Direction

## Purpose

The site represents Thapar Venture Club as a lasting student-led entrepreneurship organisation, not a one-off fest microsite. It should communicate ambition, credibility, community and continuity.

Use Apple, Microsoft, Stripe and Linear as references for craft and restraint, not as layouts to copy.

## Brand system

- Foundation: near-black and warm-white surfaces.
- Accent: TVC yellow, used selectively.
- Typography: confident display type paired with highly legible body text; keep the number of font families small.
- Composition: editorial grids, strong image crops, fine rules, deliberate whitespace and varied section rhythm.
- Logo: preserve supplied artwork exactly. Confirm colours and proportions from approved source artwork; provisional sampled values are not official brand tokens.

Avoid generic gradients, glassmorphism, floating blobs, random 3D decoration, excessive rounded cards, meaningless motion and stock imagery presented as TVC photography.

## Site experience

The current App Router includes:
- Home (`/`): brand-led hero/scroll experience, About TVC, initiatives and event storytelling, team preview and contact.
- Events (`/events`): event discovery.
- TVC x SAT / PRIMUS (`/events/tvc-x-sat`) and registration (`/events/tvc-x-sat/register`).
- E-Summit (`/events/e-summit`).
- Speakers (`/speakers`).
- Team (`/team`).
- Admin PRIMUS dashboard (`/admin/primus`), private operational route and not part of public navigation.

The source code is authoritative if a route or component changes. Do not use this document as a reason to recreate or rename working routes.

## Homepage and brand reveal

The homepage uses a cinematic TVC identity reveal and a long-form editorial scroll experience. Keep the sequence purposeful and short enough that it does not trap visitors. The final lockup and essential content must remain understandable if animation is unavailable.

- Desktop: composed movement and typography with controlled pacing.
- Tablet/mobile: adapt travel distance, type scale and section composition; do not squeeze a desktop layout into a narrow viewport.
- Reduced motion: no scroll pinning or essential information hidden behind animation.
- Never hijack native scrolling.

## Events, team and speakers

- Event pages should have distinct identities while remaining recognisably part of TVC.
- Use real approved photography, clear event information and verified registration destinations.
- Hover may add polish but must not reveal essential information unavailable to keyboard or touch users.
- Publish only approved speaker/team names, roles, affiliations and portraits.
- Do not publish personal contact details without explicit approval.

## Interaction and accessibility

- Provide visible keyboard focus and descriptive link labels.
- Ensure touch interactions have explicit affordances.
- Respect `prefers-reduced-motion`.
- Maintain readable contrast and text sizing.
- Avoid autoplay audio and scroll-jacking.
- Keep transitions quick and never delay navigation behind decorative loading.

## Performance

- Use responsive image sizes and lazy-load non-critical imagery.
- Reserve media dimensions to avoid layout shifts.
- Keep animation work scoped to components that need it.
- Test on representative mobile devices; motion must not make the site unusable.
