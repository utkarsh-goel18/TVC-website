# PRIMUS'26 registration backend

This backend supports Thapar-only team registration. External participants should continue to use the Saturnalia registration page.

## Registration rules

- Teams contain 2–4 participants.
- The team leader creates the team, selects one track, and enters their personal details.
- A generated `PRM-XXXXXXXXXXXXXXXX` code (16 hexadecimal characters) lets other verified Thapar participants join. Previously issued 8-character codes remain valid.
- Joining is allowed while the team is open and has fewer than four members.
- Only the leader can submit, and only when the team has at least two members.
- Submission locks the team.
- Each Firebase Auth UID can belong to only one team.
- The API verifies Firebase ID tokens and verified institutional email addresses.

## Hostel dropdown values

Agira Hall, Amritam Hall, Prithvi Hall, Neeram Hall, Vyan Hall, Tejas Hall, Ambaram Hall, Viyat Hall, Anantam Hall, Vyom Hall, FRF/G, Vasudha Hall, Ira Hall, Ananta Hall, Dhriti Hall, Vahni Hall, Pavani Hall, Day Scholar.

The duplicate-looking names Anantam Hall and Ananta Hall are intentionally separate. Vasudha is one option (not separate Block E/Block G options); Dhriti is shown as Dhriti Hall (not Hostel-PG).

## Firestore collections

- `primusTeams/{TEAM_CODE}`: team metadata and member records.
- `primusParticipantIndex/{FIREBASE_UID}`: enforces one team per participant.
- `primusRegistrationMeta/counts`: aggregate team creation count.
- `primusRateLimits/{ACTION_UID}`: transactional per-user attempt counters for team-code join protection and team creation.

The participant index should be writable only by Admin SDK. Do not expose Firestore client writes for these collections.

## API

All participant endpoints require `Authorization: Bearer <Firebase ID token>` from Firebase Authentication. The token must be verified and its email must be verified.

### Create team
`POST /api/primus/teams`

```json
{
  "teamName": "Team Alpha",
  "track": "Product",
  "name": "Participant Name",
  "phone": "9876543210",
  "hostel": "Vasudha Hall"
}
```

### Get current participant's team
`GET /api/primus/teams`

Returns only the team associated with the authenticated participant.

### Join team
`POST /api/primus/teams/join`

```json
{
  "teamCode": "PRM-A1B2C3D4",
  "name": "Participant Name",
  "phone": "9876543210",
  "hostel": "Day Scholar"
}
```

### Submit team
`POST /api/primus/teams/{teamCode}/submit`

Only the team leader can submit; server checks the team size transactionally.

### Admin registrations
`GET /api/primus/admin/registrations`

Requires a non-revoked Firebase ID token whose UID is included in `PRIMUS_ADMIN_UIDS`. The default response is paginated (25 records; maximum 50) and includes global summary counts. Optional query parameters: `track=Product|Consulting|Finance`, `status=OPEN|SUBMITTED`, `q=<search text>`, `cursor=<opaque next-page cursor>`. Search matches team name/code and participant name/email/phone/hall. Add `format=csv` to export all matching records for the active filters. CSV values are escaped to reduce spreadsheet formula injection risk. This endpoint exposes personal data and must remain restricted to approved admins.

### Admin dashboard
`/admin/primus`

The page uses Firebase Authentication for sign-in and relies on the server-side UID allowlist for authorisation. It is intentionally not linked from public site navigation.

## Firebase setup before deployment

1. Create/select the TVC Firebase project.
2. Enable Firebase Authentication → Email/Password or an approved email-link sign-in method. The frontend must verify each email address before calling the API.
3. Confirm the actual student email domain with TIET IT. Set `THAPAR_EMAIL_DOMAIN` to that domain; do not assume every institutional account uses the same domain.
4. Create a Cloud Firestore database in production mode.
5. From the repository root, select the intended Firebase project and deploy the checked-in Firestore rules and indexes with `firebase deploy --only firestore:rules,firestore:indexes`. The new admin filters require the composite indexes in `firestore.indexes.json`.
6. Create a service account for the server and add its Project ID, client email and private key to the deployment environment, or use the hosting provider's Application Default Credentials. Never commit the private key.
7. Add the Firebase Auth UIDs of approved TVC registration admins to the server-only `PRIMUS_ADMIN_UIDS` environment variable. Do not use admin email addresses in place of UIDs.
8. Set both `THAPAR_EMAIL_DOMAIN` (server) and `NEXT_PUBLIC_THAPAR_EMAIL_DOMAIN` (client) to the confirmed institutional email domain. The defaults are `thapar.edu`.
9. Install dependencies with `npm install` after pulling this change.
10. Configure the environment variables in the hosting provider and redeploy.

## Important launch notes

- The participant registration form, Firebase email/password sign-in and verification flow, and leader team dashboard are implemented.
- The protected admin dashboard is available at `/admin/primus`. It supports registration summaries, track/status filters, search across team/member fields, paginated browsing and filtered CSV export.
- The admin API verifies revoked tokens, checks the server-side UID allowlist, returns non-cacheable responses and escapes spreadsheet formula values in CSV exports.
- The npm lockfile pins patched `@grpc/grpc-js` and `postcss` versions to eliminate the high-severity advisories found during CI. The audit still reports moderate advisories in Firebase Admin / Google Cloud transitive dependencies and development tooling; do not force major downgrades as a quick fix. Review those separately before a wider production security sign-off.
- Participant write routes reject revoked sessions and malformed JSON. Team-code join attempts are rate-limited transactionally to eight attempts per UID per 15-minute window.
- Participant team lookups return only the shared roster fields; phone numbers and hall details remain in the admin view.
- Firebase Admin credentials are server-only. Never prefix them with `NEXT_PUBLIC_`.
- The admin export includes names, email addresses and phone numbers. Limit access to the smallest possible set of admins and publish an appropriate event privacy notice.
- Do a test registration with test accounts before opening registration publicly.


## Pre-launch verification checklist

Run these checks against a staging Firebase project with test accounts before opening the production form. Do not create test registrations in the live event database.

### Participant flow
- [ ] A verified account using the configured institutional domain can create a team and receives a unique `PRM-XXXXXXXX` code.
- [ ] An unverified account, wrong-domain account, expired token and revoked token are rejected.
- [ ] The same Firebase UID cannot create or join a second team.
- [ ] A valid team code adds a participant; an invalid or unknown code returns a clear client error.
- [ ] A team cannot exceed four members, including when two people attempt to take the final slot concurrently.
- [ ] The ninth valid-format join attempt by the same UID inside 15 minutes is rate-limited; the fourth team-creation attempt in that window is rate-limited. These are per-account controls, not IP-wide abuse protection.
- [ ] Only the leader can submit; a one-member team cannot submit; a submitted team cannot accept new members.
- [ ] The participant team lookup contains only the shared roster fields and does not return phone numbers or hall details.

### Admin flow
- [ ] Missing/invalid/revoked token returns 401; a signed-in UID outside `PRIMUS_ADMIN_UIDS` returns 403.
- [ ] An allowlisted admin can load global totals and all three track counts.
- [ ] Track and status filters work together; search finds team code/name and member name/email/phone/hall across pages.
- [ ] Next/previous pagination has no duplicate or skipped teams when multiple teams share the same creation timestamp.
- [ ] CSV export respects active filters and spreadsheet-formula-like values are treated as text.
- [ ] Admin responses are not cached by the browser or intermediary caches.

### Deployment
- [ ] Firebase Auth Email/Password is enabled and authorised domains/action URLs are correct.
- [ ] `THAPAR_EMAIL_DOMAIN` and `NEXT_PUBLIC_THAPAR_EMAIL_DOMAIN` match the domain confirmed by TIET IT.
- [ ] Firestore rules and the composite indexes from `firestore.indexes.json` are deployed to the intended project.
- [ ] The App Hosting service identity has the required Firebase Auth and Firestore permissions.
- [ ] `PRIMUS_ADMIN_UIDS` contains only the approved admin UIDs.
- [ ] A real admin login, one full test registration, CSV export and a mobile dashboard check have been completed before launch.
