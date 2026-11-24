# Security Specification — IlmNoma Firestore Rules

## 1. Data Invariants
1. **Student PII Isolation**: `/students/{studentId}` contains PII (`email`, `fullName`, `university`, `faculty`, `groupName`). Only the authenticated, email-verified user whose `request.auth.uid == studentId` may `get`, `create`, or `update` their own profile. `list` and `delete` on `/students` are strictly denied.
2. **Registration Prerequisite**: An `AcademicWork` document at `/works/{workId}` cannot be created unless the user is authenticated, email-verified, and has an existing registered profile at `/students/$(request.auth.uid)`.
3. **Strict Ownership & Immutability**: `ownerId` and `id` in `/works/{workId}` must match the authenticated user and path `{workId}`, and `uid`, `createdAt`, and `ownerId` are immutable after creation.
4. **No Shadow Fields**: Both `create` (`hasAll` + `hasOnly`) and `update` (`affectedKeys().hasOnly(...)`) reject unapproved fields.
5. **Server Timestamp Enforcement**: `createdAt` and `updatedAt` must equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Identity Spoofing on Student Create**: Authenticated user `uidA` tries `create` on `/students/uidB` or sets `uid: "uidB"`.
2. **Unverified Email Write**: User with `email_verified: false` tries `create` on `/students/uidA`.
3. **Student PII Enumeration (List)**: Authenticated user runs `list` on `/students`.
4. **Cross-User Student PII Read**: User `uidB` runs `get` on `/students/uidA`.
5. **Shadow Field Injection on Student**: User `uidA` sends `{ ..., isAdmin: true }` on `/students/uidA`.
6. **Client Timestamp Forgery**: User `uidA` sets `createdAt` to a client `Timestamp` instead of `serverTimestamp()`.
7. **Orphan Work Without Registration**: User `uidC` (no `/students/uidC` doc) tries to `create` `/works/work1`.
8. **Cross-Owner Work Create**: User `uidA` creates `/works/work1` with `ownerId: "uidB"`.
9. **Invalid Format Enum**: User `uidA` creates `/works/work1` with `format: "dissertatsiya"`.
10. **Oversized String / Resource Exhaustion**: User `uidA` sends a 5,000-char `topic` or 1.5KB path ID `/works/${"a".repeat(200)}`.
11. **Immutable Owner Tampering on Update**: User `uidA` updates `/works/work1` trying to change `ownerId` or `createdAt`.
12. **Unscoped List Query on Works**: User `uidB` queries `/works` without `where("ownerId", "==", "uidB")` (reading `uidA`'s work).
