import { useMemo, useState } from 'react';
import { Download, Search, Trash2, Eye } from 'lucide-react';
import { downloadWorkAsDocx, downloadWorkAsPptx } from '../lib/exporters';
import {
  AcademicWork,
  FORMAT_LABELS,
  LANGUAGE_LABELS,
  WorkFormat,
} from '../types/academic';

interface WorksArchiveProps {
  works: AcademicWork[];
  isLoading: boolean;
  onOpenWork: (work: AcademicWork) => void;
  onDeleteWork: (workId: string) => Promise<void>;
  onGoCreate: () => void;
}

export function WorksArchive({
  works,
  isLoading,
  onOpenWork,
  onDeleteWork,
  onGoCreate,
}: WorksArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | WorkFormat>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return works.filter((w) => {
      if (formatFilter !== 'all' && w.format !== formatFilter) return false;
      if (!q) return true;
      return (
        w.subject.toLowerCase().includes(q) ||
        w.topic.toLowerCase().includes(q) ||
        w.title.toLowerCase().includes(q)
      );
    });
  }, [works, searchQuery, formatFilter]);

  async function handleQuickDownload(work: AcademicWork) {
    setBusyId(work.id);
    try {
      if (work.format === 'taqdimot') {
        await downloadWorkAsPptx(work);
      } else {
        await downloadWorkAsDocx(work);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete(workId: string) {
    setBusyId(workId);
    try {
      await onDeleteWork(workId);
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Mening mustaqil ishlarim
          </h1>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            Jami saqlangan ishlar: {works.length} ta
          </p>
        </div>

        {/* Search & Format Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fan yoki mavzu qidirish..."
              className="pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'Barchasi' },
                { id: 'maqola', label: 'Maqola' },
                { id: 'taqdimot', label: 'Taqdimot' },
                { id: 'referat', label: 'Referat' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormatFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  formatFilter === tab.id
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-base font-medium text-slate-800">
            {works.length === 0
              ? 'Hali birorta mustaqil ish yaratilmagan'
              : "Qidiruv bo'yicha mos ish topilmadi"}
          </p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {works.length === 0
              ? "Birinchi mustaqil ishingizni yaratish uchun fan va mavzuni kiriting."
              : "Qidiruv so'zini yoki format filtrini o'zgartirib ko'ring."}
          </p>
          {works.length === 0 && (
            <button
              type="button"
              onClick={onGoCreate}
              className="mt-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Birinchi ishni yaratish
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {filtered.map((work) => (
            <div
              key={work.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-blue-900">
                    {FORMAT_LABELS[work.format]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{work.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>{LANGUAGE_LABELS[work.language]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {work.format === 'taqdimot'
                      ? `${work.slides.length} slayd`
                      : `${work.sections.length} bo'lim`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenWork(work)}
                  className="text-left text-base font-semibold text-slate-950 hover:text-blue-900 transition-colors truncate block max-w-2xl cursor-pointer"
                >
                  {work.title}
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenWork(work)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ochish</span>
                </button>

                <button
                  type="button"
                  disabled={busyId === work.id}
                  onClick={() => handleQuickDownload(work)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{work.format === 'taqdimot' ? '.pptx' : '.docx'}</span>
                </button>

                {confirmDeleteId === work.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busyId === work.id}
                      onClick={() => handleConfirmDelete(work.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      O‘chirish
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Bekor
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(work.id)}
                    aria-label="Ishni o'chirish"
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
