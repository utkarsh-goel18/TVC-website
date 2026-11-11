# PRIMUS'26 Registration Backend

This backend supports team registration for verified Thapar participants. External participants should use the approved Saturnalia registration destination configured by the frontend.

## Registration rules

- Teams contain 2–4 participants.
- The leader creates the team, selects one track (Product, Consulting or Finance) and enters their details.
- New team codes use the format `PRM-` followed by 16 uppercase hexadecimal characters (64 bits of randomness).
- Legacy 8-character hexadecimal team codes remain valid for teams created before the hardening change.
- Participants can join an open team while it has fewer than four members.
- Only the leader can submit; submission requires at least two members and locks the team.
- Each Firebase Auth UID can belong to only one team.
- Participant APIs verify Firebase ID tokens and verified institutional email addresses.

## Firestore data model

- `primusTeams/{TEAM_CODE}`: team metadata and member records.
- `primusParticipantIndex/{FIREBASE_UID}`: enforces one team per participant.
- `primusRegistrationMeta/counts`: aggregate team-creation metadata.
- `primusRateLimits/{ACTION_UID}`: transactional per-UID attempt counters for team creation and joining.

Client Firestore reads and writes are denied by `firestore.rules`. These collections are accessed by trusted server routes through Firebase Admin SDK. Do not add client-side writes or expose Admin credentials.

## Participant API

All participant endpoints require `Authorization: Bearer <Firebase ID token>`. The server verifies the token and checks the verified institutional email domain.

### Create team

`POST /api/primus/teams`

Example request:

```json
{
  "teamName": "Team Alpha",
  "track": "Product",
  "name": "Participant Name",
  "phone": "9876543210",
  "hostel": "Vasudha Hall"
}
```

Limited to 3 attempts per UID per 15-minute window. Request bodies are streamed and capped at 8 KiB.

### Get current participant's team

`GET /api/primus/teams`

Returns the authenticated participant's team with shared roster fields only. Member phone numbers and hall details are not exposed to participants.

### Join team

`POST /api/primus/teams/join`

Example request:

```json
{
  "teamCode": "PRM-A1B2C3D4E5F60718",
  "name": "Participant Name",
  "phone": "9876543210",
  "hostel": "Day Scholar"
}
```

Limited to 8 attempts per UID per 15-minute window. The limit is per account, not a global or IP-based abuse control. Request bodies are capped at 8 KiB.

### Submit team

`POST /api/primus/teams/{teamCode}/submit`

Only the leader can submit. Team size and status are checked transactionally.

## Admin API and dashboard

- Dashboard: `/admin/primus` (not linked from public navigation).
- API: `GET /api/primus/admin/registrations`.
- Requires a valid, non-revoked Firebase ID token and a UID present in the server-only `PRIMUS_ADMIN_UIDS` environment variable. Use UIDs, not email addresses.
- Default page size is 25; maximum is 50.
- Supports `track=Product|Consulting|Finance`, `status=OPEN|SUBMITTED`, `q=<search text>`, and an opaque `cursor=<next-page cursor>`.
- Search and CSV export scan at most 5,000 matching-filter team documents. If the filtered set exceeds this limit, the API returns HTTP 413 and asks the admin to narrow the filters.
- `format=csv` exports all matching records within that scan limit. CSV cells are escaped and formula-like values are prefixed to reduce spreadsheet formula injection.
- Admin responses use `Cache-Control: no-store`.

The dashboard/export contains participant personal data. Restrict the admin UID allowlist to the smallest approved group and publish an appropriate privacy notice.

## Rate-limit and retention notes

The create/join limits are transactional per Firebase UID. They help deter repeated actions and team-code guessing but do not replace edge-level IP/device controls. The rate-limit documents include an `expiresAt` field; configure and verify Firestore TTL separately if automatic expiry is required. Do not assume the TTL policy is active merely because the field exists.

## Environment and Firebase setup

See `.env.example` for variable names. Before deployment:

1. Confirm the institutional email domain with TIET IT; configure `THAPAR_EMAIL_DOMAIN` and `NEXT_PUBLIC_THAPAR_EMAIL_DOMAIN` consistently.
2. Enable the required Firebase Authentication sign-in method and verify authorised domains and email action URLs.
3. Create/select the intended Cloud Firestore database.
4. Review and deploy `firestore.rules` and `firestore.indexes.json` to the explicitly selected project.
5. Configure server-side Firebase Admin credentials or the hosting identity's Application Default Credentials. Never commit a service-account private key.
6. Set `PRIMUS_ADMIN_UIDS` to approved Firebase Auth UIDs in the server environment only.
7. Configure the Saturnalia registration URL and verify the destination.
8. Run the participant and admin checklists below against a non-production Firebase project before launch.

Example deployment command (replace the project ID only after confirming the target):

```bash
firebase deploy --only firestore:rules,firestore:indexes --project <firebase-project-id>
```

## Pre-launch verification

### Participant flow

- [ ] Verified account on the configured domain can create a team and receive a unique code.
- [ ] Unverified, wrong-domain, expired and revoked sessions are rejected.
- [ ] One UID cannot create or join a second team.
- [ ] Valid code joins; malformed/unknown code returns a clear error.
- [ ] Concurrent join attempts cannot exceed four team members.
- [ ] Create attempt 4 and join attempt 9 in a 15-minute window are rate-limited for the same UID.
- [ ] Only the leader can submit; a one-member team cannot submit; submitted teams cannot accept members.
- [ ] Participant team response excludes phone and hall details.

### Admin flow

- [ ] Missing/invalid/revoked token returns 401; non-allowlisted UID returns 403.
- [ ] Approved admin can view global and per-track totals.
- [ ] Track/status filters, search and cursor pagination behave correctly.
- [ ] CSV respects active filters and formula-like values are treated as text.
- [ ] Broad search/export above the 5,000-team cap returns 413.
- [ ] Admin responses are not cached.

### Deployment

- [ ] Auth domains/action URLs and institutional email domain are confirmed.
- [ ] Firestore rules and indexes are deployed to the intended project.
- [ ] Hosting identity has only required Firebase permissions.
- [ ] Admin allowlist contains only approved UIDs.
- [ ] TTL policy is configured if expiry is expected.
- [ ] Real admin login, test registration, CSV export and mobile dashboard checks pass before public launch.
