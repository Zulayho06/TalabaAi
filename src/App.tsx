import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingView } from './components/LandingView';
import { RegistrationView } from './components/RegistrationView';
import { ActiveTab, TopBar } from './components/TopBar';
import { WorkGenerator } from './components/WorkGenerator';
import { WorksArchive } from './components/WorksArchive';
import { WorkViewer } from './components/WorkViewer';
import {
  auth,
  createAcademicWork,
  deleteAcademicWork,
  fetchStudentProfile,
  googleProvider,
  saveStudentProfile,
  subscribeStudentWorks,
  updateAcademicWorkContent,
} from './lib/firebase';
import {
  AcademicWork,
  GeneratedWorkPayload,
  StudentProfile,
  WorkDepth,
  WorkFormat,
  WorkLanguage,
} from './types/academic';

function generateWorkId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `work_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function PlatformApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [works, setWorks] = useState<AcademicWork[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [selectedWork, setSelectedWork] = useState<AcademicWork | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthError(null);
      if (!nextUser) {
        setStudentProfile(null);
        setWorks([]);
        setSelectedWork(null);
        setAuthReady(true);
        return;
      }

      setProfileLoading(true);
      try {
        const profile = await fetchStudentProfile(nextUser.uid);
        setStudentProfile(profile);
      } catch (err) {
        setAuthError(
          err instanceof Error
            ? err.message
            : "Talaba profilini yuklashda xatolik yuz berdi."
        );
      } finally {
        setProfileLoading(false);
        setAuthReady(true);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !studentProfile) {
      setWorks([]);
      return;
    }
    setWorksLoading(true);
    const unsub = subscribeStudentWorks(
      user.uid,
      (items) => {
        setWorks(items);
        setWorksLoading(false);
      },
      (err) => {
        setWorksLoading(false);
        setAuthError(err.message);
      }
    );
    return () => unsub();
  }, [user, studentProfile]);

  async function handleGoogleSignIn() {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google orqali kirishda xatolik yuz berdi.'
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setActiveTab('create');
    setSelectedWork(null);
  }

  async function handleSaveProfile(
    profileData: Omit<StudentProfile, 'createdAt' | 'updatedAt'>
  ) {
    const isNew = !studentProfile;
    await saveStudentProfile(profileData, isNew);
    setStudentProfile({ ...profileData });
    if (isNew) {
      setActiveTab('create');
    }
  }

  async function handleWorkGenerated(params: {
    format: WorkFormat;
    subject: string;
    topic: string;
    language: WorkLanguage;
    depth: WorkDepth;
    requirements: string;
    payload: GeneratedWorkPayload;
  }) {
    if (!user || !studentProfile) return;

    const newWork: AcademicWork = {
      id: generateWorkId(),
      ownerId: user.uid,
      format: params.format,
      subject: params.subject,
      topic: params.topic,
      language: params.language,
      depth: params.depth,
      requirements: params.requirements,
      title: params.payload.title,
      subtitle: params.payload.subtitle,
      abstract: params.payload.abstract,
      keywords: params.payload.keywords,
      sections: params.payload.sections,
      slides: params.payload.slides,
      references: params.payload.references,
      studentName: studentProfile.fullName,
      university: studentProfile.university,
      faculty: studentProfile.faculty,
      groupName: studentProfile.groupName,
    };

    await createAcademicWork(newWork);
    setSelectedWork(newWork);
    setActiveTab('create');
  }

  async function handleUpdateWork(updated: AcademicWork) {
    await updateAcademicWorkContent(updated);
    setSelectedWork(updated);
  }

  async function handleDeleteWork(workId: string) {
    await deleteAcademicWork(workId);
    if (selectedWork?.id === workId) {
      setSelectedWork(null);
    }
  }

  function handleTopBarPrimaryAction() {
    if (!user) {
      void handleGoogleSignIn();
      return;
    }
    if (!studentProfile) {
      void handleSignOut();
      return;
    }
    setSelectedWork(null);
    setActiveTab('create');
  }

  const primaryActionLabel = !user
    ? isSigningIn
      ? 'Kirilmoqda...'
      : "Ro'yxatdan o'tish"
    : !studentProfile
    ? 'Chiqish'
    : 'Yangi ish';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        isSignedIn={Boolean(user)}
        hasProfile={Boolean(studentProfile)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'create') {
            setSelectedWork(null);
          }
        }}
        onPrimaryAction={handleTopBarPrimaryAction}
        primaryActionLabel={primaryActionLabel}
        isBusy={isSigningIn}
      />

      <div className="flex-1">
        {!authReady || profileLoading ? (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="bg-white border border-slate-200 rounded-xl p-10 space-y-4">
              <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
              <div className="h-40 w-full bg-slate-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : !user ? (
          <LandingView
            onGoogleSignIn={handleGoogleSignIn}
            isSigningIn={isSigningIn}
            authError={authError}
          />
        ) : !studentProfile ? (
          <RegistrationView
            uid={user.uid}
            email={user.email || ''}
            initialDisplayName={user.displayName || ''}
            existingProfile={null}
            onSave={handleSaveProfile}
            onSignOut={handleSignOut}
          />
        ) : (
          <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {activeTab === 'create' && (
              selectedWork ? (
                <WorkViewer
                  work={selectedWork}
                  onBack={() => setSelectedWork(null)}
                  onUpdateWork={handleUpdateWork}
                />
              ) : (
                <WorkGenerator
                  student={studentProfile}
                  onWorkGenerated={handleWorkGenerated}
                />
              )
            )}

            {activeTab === 'archive' && (
              selectedWork ? (
                <WorkViewer
                  work={selectedWork}
                  onBack={() => setSelectedWork(null)}
                  onUpdateWork={handleUpdateWork}
                />
              ) : (
                <WorksArchive
                  works={works}
                  isLoading={worksLoading}
                  onOpenWork={(w) => setSelectedWork(w)}
                  onDeleteWork={handleDeleteWork}
                  onGoCreate={() => {
                    setSelectedWork(null);
                    setActiveTab('create');
                  }}
                />
              )
            )}

            {activeTab === 'profile' && (
              <RegistrationView
                uid={user.uid}
                email={user.email || ''}
                initialDisplayName={user.displayName || ''}
                existingProfile={studentProfile}
                onSave={handleSaveProfile}
                onSignOut={handleSignOut}
              />
            )}
          </main>
        )}
      </div>

      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>IlmNoma · Talabalar mustaqil ishlari platformasi</span>
          <span>Maqola · Taqdimot · Referat</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PlatformApp />
    </ErrorBoundary>
  );
}
