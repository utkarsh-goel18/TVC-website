# Quality Assurance and Launch Checklist

Use this as a living checklist. Mark an item complete only after testing the current implementation and recording any relevant limitation.

## Public website

- [ ] Public routes load and internal navigation points to the intended pages.
- [ ] Header, footer and event CTAs work on desktop and mobile.
- [ ] Supplied TVC logo artwork is preserved accurately.
- [ ] Approved event, team and speaker content is used; no placeholder is presented as fact.
- [ ] All external registration links are verified and current.
- [ ] Images have appropriate alt text and responsive dimensions.
- [ ] No broken image/video paths or avoidable layout shifts.

## Responsive and accessibility

- [ ] Test representative mobile, tablet and desktop widths.
- [ ] Keyboard navigation and visible focus work throughout.
- [ ] Essential content is not hover-only.
- [ ] Reduced-motion preferences are respected.
- [ ] Contrast, text sizing and link labels are readable.
- [ ] Browser back/forward navigation behaves normally.

## Performance and metadata

- [ ] Large images are served at appropriate responsive sizes; originals remain preserved.
- [ ] Non-critical media is lazy-loaded where appropriate.
- [ ] Animation remains smooth on representative mobile hardware.
- [ ] Page titles, descriptions and social preview metadata are correct.
- [ ] Sitemap and robots behaviour matches the intended public routes.

## PRIMUS registration

- [ ] Confirm the PRIMUS registration CTA points to the approved Saturnalia event registration page.
- [ ] Confirm there is no separate TVC registration form, login, team creation or submission flow.
- [ ] Confirm the same Saturnalia registration destination is presented to TIET and external participants.
- [ ] Verify no public navigation or event CTA links to the retired TVC registration route.

## Release sign-off

- [ ] `npm run typecheck` passes.
- [ ] Relevant lint checks pass; unrelated legacy findings are recorded.
- [ ] `npm run build` passes.
- [ ] UI has been inspected at desktop and mobile sizes.
- [ ] Production environment variables, Auth domains/action URLs and Firebase configuration are verified.
- [ ] Production deployment and a live smoke test are explicitly confirmed (do not infer them from local tests or CI).
