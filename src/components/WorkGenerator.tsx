import React, { useState } from 'react';
import { BookOpen, FileText, Presentation, Loader2 } from 'lucide-react';
import {
  BLUEPRINT_LIMITS,
  DEPTH_LABELS,
  GeneratedWorkPayload,
  LANGUAGE_LABELS,
  StudentProfile,
  WorkDepth,
  WorkFormat,
  WorkLanguage,
} from '../types/academic';

interface WorkGeneratorProps {
  student: StudentProfile;
  onWorkGenerated: (params: {
    format: WorkFormat;
    subject: string;
    topic: string;
    language: WorkLanguage;
    depth: WorkDepth;
    requirements: string;
    payload: GeneratedWorkPayload;
  }) => Promise<void>;
}

const FORMAT_OPTIONS: Array<{
  id: WorkFormat;
  title: string;
  fileType: string;
  summary: string;
  icon: typeof BookOpen;
}> = [
  {
    id: 'maqola',
    title: 'Maqola',
    fileType: '.docx (Word)',
    summary: "Annotatsiya, kalit so'zlar, IMRAD bo'limlar va adabiyotlar.",
    icon: BookOpen,
  },
  {
    id: 'taqdimot',
    title: 'Taqdimot',
    fileType: '.pptx (PowerPoint)',
    summary: "16:9 slaydlar to'plami, tezislar va ma'ruzachi izohlari.",
    icon: Presentation,
  },
  {
    id: 'referat',
    title: 'Referat',
    fileType: '.docx (Word)',
    summary: "Rasmiy titul varaq, reja, boblar, xulosa va adabiyotlar.",
    icon: FileText,
  },
];

const QUICK_STARTERS: Array<{ subject: string; topic: string; format: WorkFormat }> = [
  {
    subject: 'Axborot texnologiyalari',
    topic: "Sun'iy intellekt tizimlarining zamonaviy ta'limdagi o'rni",
    format: 'taqdimot',
  },
  {
    subject: 'Iqtisodiyot nazariyasi',
    topic: "Raqamli iqtisodiyotda kichik biznesni rivojlantirish mexanizmlari",
    format: 'maqola',
  },
  {
    subject: 'Ekologiya va atrof-muhit',
    topic: "O'zbekistonda qayta tiklanuvchi energiya manbalaridan foydalanish istiqbollari",
    format: 'referat',
  },
];

export function WorkGenerator({ student, onWorkGenerated }: WorkGeneratorProps) {
  const [format, setFormat] = useState<WorkFormat>('referat');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<WorkLanguage>('uz');
  const [depth, setDepth] = useState<WorkDepth>('standard');
  const [requirements, setRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (subject.trim().length < 2) {
      setError('Iltimos, fan nomini kamida 2 ta harf bilan kiriting.');
      return;
    }
    if (topic.trim().length < 3) {
      setError('Iltimos, mustaqil ish mavzusini batafsilroq kiriting.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          subject: subject.trim(),
          topic: topic.trim(),
          language,
          depth,
          requirements: requirements.trim(),
          studentName: student.fullName,
          university: student.university,
          faculty: student.faculty,
          groupName: student.groupName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Ishni yaratishda xatolik yuz berdi.');
      }

      await onWorkGenerated({
        format,
        subject: subject.trim(),
        topic: topic.trim(),
        language,
        depth,
        requirements: requirements.trim(),
        payload: data as GeneratedWorkPayload,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Server bilan bog‘lanishda xatolik yuz berdi.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-blue-900">
            {student.fullName} · {student.university} · {student.groupName}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
            Yangi mustaqil ish tayyorlash
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Tayyor ish avtomatik arxivga saqlanadi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Step 1: Format Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-2.5">
            1. Ish ko‘rinishini tanlang
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = format === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormat(opt.id)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                    selected
                      ? 'border-blue-900 bg-blue-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Icon
                        className={`w-4 h-4 ${
                          selected ? 'text-blue-900' : 'text-slate-500'
                        }`}
                      />
                      <span>{opt.title}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {opt.fileType}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {opt.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Subject & Topic */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5">
            <label
              htmlFor="gen-subject"
              className="block text-sm font-medium text-slate-800"
            >
              2. Fan nomi
            </label>
            <input
              id="gen-subject"
              type="text"
              required
              maxLength={BLUEPRINT_LIMITS.subjectMax}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Masalan: Dasturlash asoslari"
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
            />
          </div>

          <div className="md:col-span-7">
            <label
              htmlFor="gen-topic"
              className="block text-sm font-medium text-slate-800"
            >
              3. Mustaqil ish mavzusi
            </label>
            <input
              id="gen-topic"
              type="text"
              required
              maxLength={BLUEPRINT_LIMITS.topicMax}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: Obyektga yo'naltirilgan dasturlash tamoyillari"
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
            />
          </div>
        </div>

        {/* Subtle text quick starters */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          <span>Namuna mavzular:</span>
          {QUICK_STARTERS.map((starter, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSubject(starter.subject);
                setTopic(starter.topic);
                setFormat(starter.format);
              }}
              className="text-blue-900 hover:underline cursor-pointer text-left"
            >
              {starter.subject} ({starter.format})
            </button>
          ))}
        </div>

        {/* Step 3: Language & Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <span className="block text-sm font-medium text-slate-800 mb-1.5">
              4. Hujjat tili
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {(['uz', 'en', 'ru'] as WorkLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    language === lang
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-800 mb-1.5">
              5. Hajm va batafsillik
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {(['short', 'standard', 'extended'] as WorkDepth[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    depth === d
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {DEPTH_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional requirements */}
        <div>
          <label
            htmlFor="gen-req"
            className="block text-sm font-medium text-slate-800"
          >
            6. Qo‘shimcha talablar yoki reja bandlari (ixtiyoriy)
          </label>
          <textarea
            id="gen-req"
            rows={2}
            maxLength={BLUEPRINT_LIMITS.requirementsMax}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Masalan: O'zbekiston misolida tahlil qilinsin, kamida 3 ta amaliy misol keltirilsin..."
            className="mt-1.5 w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500">
            Tanlangan format:{' '}
            <strong className="font-semibold text-slate-800">
              {FORMAT_OPTIONS.find((f) => f.id === format)?.title}
            </strong>{' '}
            ({FORMAT_OPTIONS.find((f) => f.id === format)?.fileType})
          </p>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {isGenerating
                ? 'Mustaqil ish tayyorlanmoqda...'
                : 'Mustaqil ishni yaratish'}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}
