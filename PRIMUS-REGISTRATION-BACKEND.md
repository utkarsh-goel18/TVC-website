# PRIMUS'26 registration backend

This backend supports Thapar-only team registration. External participants should continue to use the Saturnalia registration page.

## Registration rules

- Teams contain 2–4 participants.
- The team leader creates the team, selects one track, and enters their personal details.
- A generated `PRM-XXXXXXXX` code lets other verified Thapar participants join.
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
- Participant team lookups return only the shared roster fields; phone numbers and hall details remain in the admin view.
- Firebase Admin credentials are server-only. Never prefix them with `NEXT_PUBLIC_`.
- The admin export includes names, email addresses and phone numbers. Limit access to the smallest possible set of admins and publish an appropriate event privacy notice.
- Do a test registration with test accounts before opening registration publicly.
