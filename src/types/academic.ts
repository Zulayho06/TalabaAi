export type WorkFormat = 'maqola' | 'taqdimot' | 'referat';
export type WorkLanguage = 'uz' | 'en' | 'ru';
export type WorkDepth = 'short' | 'standard' | 'extended';
export type CourseYear = '1-kurs' | '2-kurs' | '3-kurs' | '4-kurs' | 'Magistratura';

export interface StudentProfile {
  uid: string;
  fullName: string;
  university: string;
  faculty: string;
  groupName: string;
  courseYear: CourseYear;
  email: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface WorkSection {
  heading: string;
  paragraphs: string[];
}

export interface PresentationSlide {
  title: string;
  subtitle?: string;
  bullets: string[];
  notes: string;
}

export interface GeneratedWorkPayload {
  title: string;
  subtitle: string;
  abstract: string;
  keywords: string[];
  sections: WorkSection[];
  slides: PresentationSlide[];
  references: string[];
}

export interface AcademicWork extends GeneratedWorkPayload {
  id: string;
  ownerId: string;
  format: WorkFormat;
  subject: string;
  topic: string;
  language: WorkLanguage;
  depth: WorkDepth;
  requirements: string;
  studentName: string;
  university: string;
  faculty: string;
  groupName: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const COURSE_YEAR_OPTIONS: CourseYear[] = [
  '1-kurs',
  '2-kurs',
  '3-kurs',
  '4-kurs',
  'Magistratura',
];

export const FORMAT_LABELS: Record<WorkFormat, string> = {
  maqola: 'Maqola',
  taqdimot: 'Taqdimot',
  referat: 'Referat',
};

export const LANGUAGE_LABELS: Record<WorkLanguage, string> = {
  uz: "O'zbekcha",
  en: 'Inglizcha',
  ru: 'Ruscha',
};

export const DEPTH_LABELS: Record<WorkDepth, string> = {
  short: 'Qisqa',
  standard: 'Standart',
  extended: 'Kengaytirilgan',
};

export const BLUEPRINT_LIMITS = {
  fullNameMax: 120,
  universityMax: 180,
  facultyMax: 160,
  groupNameMax: 60,
  subjectMax: 140,
  topicMax: 240,
  requirementsMax: 800,
  titleMax: 260,
  subtitleMax: 300,
  abstractMax: 3000,
  keywordsMaxCount: 10,
  keywordMaxLen: 80,
  sectionsMaxCount: 15,
  sectionHeadingMax: 240,
  paragraphsMaxCount: 20,
  slidesMaxCount: 20,
  slideTitleMax: 240,
  bulletsMaxCount: 12,
  slideNotesMax: 1200,
  referencesMaxCount: 20,
  referenceMaxLen: 400,
} as const;

export function clampStr(val: string, max: number): string {
  return val.trim().slice(0, max);
}

export function sanitizeAcademicWorkForSave(work: AcademicWork): Omit<AcademicWork, 'createdAt' | 'updatedAt'> {
  return {
    id: clampStr(work.id, 128),
    ownerId: clampStr(work.ownerId, 128),
    format: work.format,
    subject: clampStr(work.subject, BLUEPRINT_LIMITS.subjectMax),
    topic: clampStr(work.topic, BLUEPRINT_LIMITS.topicMax),
    language: work.language,
    depth: work.depth,
    requirements: clampStr(work.requirements || '', BLUEPRINT_LIMITS.requirementsMax),
    title: clampStr(work.title, BLUEPRINT_LIMITS.titleMax),
    subtitle: clampStr(work.subtitle || '', BLUEPRINT_LIMITS.subtitleMax),
    abstract: clampStr(work.abstract || '', BLUEPRINT_LIMITS.abstractMax),
    keywords: (work.keywords || [])
      .map((k) => clampStr(k, BLUEPRINT_LIMITS.keywordMaxLen))
      .filter(Boolean)
      .slice(0, BLUEPRINT_LIMITS.keywordsMaxCount),
    sections: (work.sections || [])
      .slice(0, BLUEPRINT_LIMITS.sectionsMaxCount)
      .map((sec) => ({
        heading: clampStr(sec.heading, BLUEPRINT_LIMITS.sectionHeadingMax) || "Bo'lim",
        paragraphs: (sec.paragraphs || [])
          .map((p) => p.trim())
          .filter(Boolean)
          .slice(0, BLUEPRINT_LIMITS.paragraphsMaxCount),
      })),
    slides: (work.slides || [])
      .slice(0, BLUEPRINT_LIMITS.slidesMaxCount)
      .map((sl) => ({
        title: clampStr(sl.title, BLUEPRINT_LIMITS.slideTitleMax) || 'Slayd',
        subtitle: clampStr(sl.subtitle || '', BLUEPRINT_LIMITS.slideTitleMax),
        bullets: (sl.bullets || [])
          .map((b) => b.trim())
          .filter(Boolean)
          .slice(0, BLUEPRINT_LIMITS.bulletsMaxCount),
        notes: clampStr(sl.notes || '', BLUEPRINT_LIMITS.slideNotesMax),
      })),
    references: (work.references || [])
      .map((r) => clampStr(r, BLUEPRINT_LIMITS.referenceMaxLen))
      .filter(Boolean)
      .slice(0, BLUEPRINT_LIMITS.referencesMaxCount),
    studentName: clampStr(work.studentName, BLUEPRINT_LIMITS.fullNameMax),
    university: clampStr(work.university, BLUEPRINT_LIMITS.universityMax),
    faculty: clampStr(work.faculty, BLUEPRINT_LIMITS.facultyMax),
    groupName: clampStr(work.groupName, BLUEPRINT_LIMITS.groupNameMax),
  };
}
