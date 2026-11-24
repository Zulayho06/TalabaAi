import React, { useState } from 'react';
import {
  BLUEPRINT_LIMITS,
  COURSE_YEAR_OPTIONS,
  CourseYear,
  StudentProfile,
} from '../types/academic';

interface RegistrationViewProps {
  uid: string;
  email: string;
  initialDisplayName: string;
  existingProfile: StudentProfile | null;
  onSave: (profile: Omit<StudentProfile, 'createdAt' | 'updatedAt'>) => Promise<void>;
  onSignOut?: () => void;
}

export function RegistrationView({
  uid,
  email,
  initialDisplayName,
  existingProfile,
  onSave,
  onSignOut,
}: RegistrationViewProps) {
  const [fullName, setFullName] = useState(
    existingProfile?.fullName || initialDisplayName || ''
  );
  const [university, setUniversity] = useState(existingProfile?.university || '');
  const [faculty, setFaculty] = useState(existingProfile?.faculty || '');
  const [groupName, setGroupName] = useState(existingProfile?.groupName || '');
  const [courseYear, setCourseYear] = useState<CourseYear>(
    existingProfile?.courseYear || '2-kurs'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const isEditing = Boolean(existingProfile);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedNotice(false);

    if (fullName.trim().length < 2) {
      setError("Iltimos, to'liq ism-sharifingizni kiriting (kamida 2 ta belgi).");
      return;
    }
    if (university.trim().length < 2) {
      setError("Iltimos, Oliy ta'lim muassasasi (OTM) nomini kiriting.");
      return;
    }
    if (faculty.trim().length < 2) {
      setError("Iltimos, fakultet yoki yo'nalish nomini kiriting.");
      return;
    }
    if (groupName.trim().length < 1) {
      setError('Iltimos, guruh raqamingizni kiriting.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        uid,
        fullName: fullName.trim(),
        university: university.trim(),
        faculty: faculty.trim(),
        groupName: groupName.trim(),
        courseYear,
        email,
      });
      if (isEditing) {
        setSavedNotice(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ma'lumotlarni saqlashda xatolik yuz berdi."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Registration Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-blue-900">
                {isEditing ? 'Talaba profili' : "1-qadam · Majburiy registratsiya"}
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                {isEditing
                  ? "Talaba ma'lumotlarini tahrirlash"
                  : "Talaba sifatida ro'yxatdan o'tish"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {email} · Ushbu ma‘lumotlar tayyorlangan referat, maqola va taqdimot titul varag‘iga avtomatik qo‘yiladi.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="reg-fullname"
                className="block text-sm font-medium text-slate-800"
              >
                To‘liq ism-sharif (F.I.O.)
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                maxLength={BLUEPRINT_LIMITS.fullNameMax}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masalan: Karimov Azizbek Dilshodovich"
                className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
              />
            </div>

            <div>
              <label
                htmlFor="reg-university"
                className="block text-sm font-medium text-slate-800"
              >
                Oliy ta‘lim muassasasi (OTM)
              </label>
              <input
                id="reg-university"
                type="text"
                required
                maxLength={BLUEPRINT_LIMITS.universityMax}
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Masalan: Toshkent Axborot Texnologiyalari Universiteti"
                className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
              />
            </div>

            <div>
              <label
                htmlFor="reg-faculty"
                className="block text-sm font-medium text-slate-800"
              >
                Fakultet / Yo‘nalish
              </label>
              <input
                id="reg-faculty"
                type="text"
                required
                maxLength={BLUEPRINT_LIMITS.facultyMax}
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Masalan: Dasturiy injiniring fakulteti"
                className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reg-group"
                  className="block text-sm font-medium text-slate-800"
                >
                  Guruh
                </label>
                <input
                  id="reg-group"
                  type="text"
                  required
                  maxLength={BLUEPRINT_LIMITS.groupNameMax}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Masalan: DI-214"
                  className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-course"
                  className="block text-sm font-medium text-slate-800"
                >
                  Kurs
                </label>
                <select
                  id="reg-course"
                  value={courseYear}
                  onChange={(e) => setCourseYear(e.target.value as CourseYear)}
                  className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                >
                  {COURSE_YEAR_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
              >
                {error}
              </div>
            )}

            {savedNotice && (
              <div
                role="status"
                className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800"
              >
                Profil ma‘lumotlari muvaffaqiyatli yangilandi.
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                {isSaving
                  ? 'Saqlanmoqda...'
                  : isEditing
                  ? "O'zgarishlarni saqlash"
                  : "Ro'yxatdan o'tishni yakunlash"}
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  Hisobdan chiqish
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Live Cover Page Preview */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <div className="text-xs font-medium text-slate-500">
              Titul varag‘i namunasi
            </div>
            <div className="mt-4 border border-slate-200 bg-slate-50/70 rounded-lg p-6 font-serif text-slate-900 aspect-[3/4] flex flex-col justify-between text-center">
              <div className="space-y-1.5 text-[11px] leading-snug text-slate-700">
                <p className="font-semibold uppercase tracking-wide">
                  Oliy ta‘lim, fan va innovatsiyalar vazirligi
                </p>
                <p className="font-semibold uppercase text-slate-900">
                  {university.trim() || 'OTM NOMI'}
                </p>
                <p>{faculty.trim() || 'Fakultet nomi'}</p>
              </div>

              <div className="space-y-2 my-auto py-6">
                <p className="text-lg font-bold tracking-wide text-blue-950">
                  MUSTAQIL ISH
                </p>
                <p className="text-xs text-slate-600">
                  Fan va mavzu bu yerda ko‘rsatiladi
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-right text-xs text-slate-800 space-y-1">
                  <p>
                    <span className="text-slate-500">Bajardi: </span>
                    <span className="font-semibold">
                      {fullName.trim() || 'Talaba F.I.O.'}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Guruh: </span>
                    <span>
                      {groupName.trim() || 'Guruh'} · {courseYear}
                    </span>
                  </p>
                </div>
                <p className="text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200 tabular-nums">
                  {new Date().getFullYear()}-yil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
