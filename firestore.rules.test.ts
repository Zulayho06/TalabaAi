// Phase 0 Security Rules Verification Specification (Emulator Reference)
// Documents the Dirty Dozen assertions enforced by firestore.rules.

export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  { id: 1, name: 'Identity Spoofing on Student Create', collectionPath: '/students/uidB', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Unverified Email Write', collectionPath: '/students/uidA', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Student PII Enumeration (List)', collectionPath: '/students', operation: 'list', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Cross-User Student PII Read', collectionPath: '/students/uidA', operation: 'get', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Shadow Field Injection on Student', collectionPath: '/students/uidA', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Client Timestamp Forgery', collectionPath: '/students/uidA', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Orphan Work Without Registration', collectionPath: '/works/work1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Cross-Owner Work Create', collectionPath: '/works/work1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Invalid Format Enum', collectionPath: '/works/work1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Oversized String / Path ID Poisoning', collectionPath: '/works/' + 'a'.repeat(200), operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Immutable Owner Tampering on Update', collectionPath: '/works/work1', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Unscoped List Query on Works', collectionPath: '/works', operation: 'list', expected: 'PERMISSION_DENIED' },
];
