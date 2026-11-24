import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AcademicWork,
  BLUEPRINT_LIMITS,
  clampStr,
  sanitizeAcademicWorkForSave,
  StudentProfile,
} from '../types/academic';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export async function fetchStudentProfile(uid: string): Promise<StudentProfile | null> {
  const path = `students/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'students', uid));
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as StudentProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveStudentProfile(
  profile: Omit<StudentProfile, 'createdAt' | 'updatedAt'>,
  isNew: boolean
): Promise<void> {
  const path = `students/${profile.uid}`;
  const clean = {
    uid: clampStr(profile.uid, 128),
    fullName: clampStr(profile.fullName, BLUEPRINT_LIMITS.fullNameMax),
    university: clampStr(profile.university, BLUEPRINT_LIMITS.universityMax),
    faculty: clampStr(profile.faculty, BLUEPRINT_LIMITS.facultyMax),
    groupName: clampStr(profile.groupName, BLUEPRINT_LIMITS.groupNameMax),
    courseYear: profile.courseYear,
    email: clampStr(profile.email, 160),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'students', clean.uid), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'students', clean.uid), {
        fullName: clean.fullName,
        university: clean.university,
        faculty: clean.faculty,
        groupName: clean.groupName,
        courseYear: clean.courseYear,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export function subscribeStudentWorks(
  uid: string,
  onData: (works: AcademicWork[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = 'works';
  const worksQuery = query(
    collection(db, 'works'),
    where('ownerId', '==', uid),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(
    worksQuery,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as AcademicWork);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function createAcademicWork(work: AcademicWork): Promise<void> {
  const clean = sanitizeAcademicWorkForSave(work);
  const path = `works/${clean.id}`;
  try {
    await setDoc(doc(db, 'works', clean.id), {
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAcademicWorkContent(work: AcademicWork): Promise<void> {
  const clean = sanitizeAcademicWorkForSave(work);
  const path = `works/${clean.id}`;
  try {
    await updateDoc(doc(db, 'works', clean.id), {
      title: clean.title,
      subtitle: clean.subtitle,
      abstract: clean.abstract,
      keywords: clean.keywords,
      sections: clean.sections,
      slides: clean.slides,
      references: clean.references,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAcademicWork(workId: string): Promise<void> {
  const path = `works/${workId}`;
  try {
    await deleteDoc(doc(db, 'works', workId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
