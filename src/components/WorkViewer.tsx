import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Printer,
  Save,
} from 'lucide-react';
import { downloadWorkAsDocx, downloadWorkAsPptx } from '../lib/exporters';
import {
  AcademicWork,
  DEPTH_LABELS,
  FORMAT_LABELS,
  LANGUAGE_LABELS,
} from '../types/academic';

interface WorkViewerProps {
  work: AcademicWork;
  onBack?: () => void;
  onUpdateWork: (updated: AcademicWork) => Promise<void>;
}

export function WorkViewer({ work, onBack, onUpdateWork }: WorkViewerProps) {
  const [draft, setDraft] = useState<AcademicWork>(work);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraft(work);
    setActiveSlideIndex(0);
    setIsEditing(false);
    setStatusMessage(null);
  }, [work]);

  async function handleDownloadPrimary() {
    setIsDownloading(true);
    setStatusMessage(null);
    try {
      if (draft.format === 'taqdimot') {
        await downloadWorkAsPptx(draft);
      } else {
        await downloadWorkAsDocx(draft);
      }
      setStatusMessage(
        draft.format === 'taqdimot'
          ? '.pptx taqdimot fayli yuklab olindi.'
          : '.docx Word hujjati yuklab olindi.'
      );
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Yuklab olishda xatolik yuz berdi.'
      );
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleSaveEdits() {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await onUpdateWork(draft);
      setIsEditing(false);
      setStatusMessage("Tahrirlar muvaffaqiyatli saqlandi.");
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Saqlashda xatolik yuz berdi.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  const slides = draft.slides.length > 0 ? draft.slides : [];
  const safeSlideIdx = Math.min(activeSlideIndex, Math.max(0, slides.length - 1));
  const currentSlide = slides[safeSlideIdx];

  return (
    <section className="space-y-6">
      {/* Toolbar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {onBack && (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1 text-blue-900 font-medium hover:underline cursor-pointer mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Orqaga</span>
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="font-semibold text-slate-800">
              {FORMAT_LABELS[draft.format]}
            </span>
            <span aria-hidden="true">·</span>
            <span>{draft.subject}</span>
            <span aria-hidden="true">·</span>
            <span>{LANGUAGE_LABELS[draft.language]}</span>
            <span aria-hidden="true">·</span>
            <span>{DEPTH_LABELS[draft.depth]}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-950 leading-snug">
            {draft.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isEditing ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveEdits}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tahrirlash</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chop etish / PDF</span>
          </button>

          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadPrimary}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isDownloading
                ? 'Tayyorlanmoqda...'
                : draft.format === 'taqdimot'
                ? 'Yuklab olish (.pptx)'
                : 'Yuklab olish (.docx)'}
            </span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="no-print px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
        >
          {statusMessage}
        </div>
      )}

      {/* Presentation Mode (Taqdimot) */}
      {draft.format === 'taqdimot' && slides.length > 0 ? (
        <div className="print-document grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Slide Thumbnail Strip */}
          <aside className="no-print lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 max-h-[560px] overflow-y-auto">
            <div className="px-2 py-1 text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Slaydlar ro‘yxati</span>
              <span className="font-mono tabular-nums">{slides.length} ta</span>
            </div>
            {slides.map((sl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  idx === safeSlideIdx
                    ? 'border-blue-900 bg-blue-50/70'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium text-slate-800 line-clamp-2">
                    {sl.title}
                  </span>
                </div>
              </button>
            ))}
          </aside>

          {/* Active 16:9 Slide Stage */}
          <div className="lg:col-span-9 space-y-4">
            {currentSlide && (
              <div
                className={`border border-slate-200 rounded-xl overflow-hidden ${
                  safeSlideIdx === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}
              >
                <div className="h-1.5 bg-blue-800 w-full" />
                <div className="p-8 sm:p-12 min-h-[380px] flex flex-col justify-between">
                  <div>
                    <div
                      className={`text-xs font-mono tabular-nums ${
                        safeSlideIdx === 0 ? 'text-blue-300' : 'text-slate-400'
                      }`}
                    >
                      {draft.subject} · Slayd {String(safeSlideIdx + 1).padStart(2, '0')} /{' '}
                      {String(slides.length).padStart(2, '0')}
                    </div>

                    {isEditing ? (
                      <input
                        type="text"
                        value={currentSlide.title}
                        onChange={(e) => {
                          const next = [...draft.slides];
                          next[safeSlideIdx] = {
                            ...currentSlide,
                            title: e.target.value,
                          };
                          setDraft({ ...draft, slides: next });
                        }}
                        className="mt-3 w-full px-3 py-2 text-2xl font-bold bg-slate-100 text-slate-900 border border-slate-300 rounded-lg"
                      />
                    ) : (
                      <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                        {currentSlide.title}
                      </h3>
                    )}

                    {currentSlide.subtitle && (
                      <p
                        className={`mt-2 text-sm ${
                          safeSlideIdx === 0 ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {currentSlide.subtitle}
                      </p>
                    )}

                    <ul className="mt-6 space-y-3">
                      {currentSlide.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed">
                          <span
                            aria-hidden="true"
                            className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${
                              safeSlideIdx === 0 ? 'bg-blue-400' : 'bg-blue-900'
                            }`}
                          />
                          {isEditing ? (
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const nextSlides = [...draft.slides];
                                const nextBullets = [...currentSlide.bullets];
                                nextBullets[bIdx] = e.target.value;
                                nextSlides[safeSlideIdx] = {
                                  ...currentSlide,
                                  bullets: nextBullets,
                                };
                                setDraft({ ...draft, slides: nextSlides });
                              }}
                              className="w-full px-2.5 py-1.5 text-sm bg-slate-100 text-slate-900 border border-slate-300 rounded"
                            />
                          ) : (
                            <span>{bullet}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`mt-8 pt-4 border-t text-xs flex items-center justify-between ${
                      safeSlideIdx === 0
                        ? 'border-slate-800 text-slate-400'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>
                      {draft.studentName} · {draft.university}
                    </span>
                    <span>{draft.groupName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide Navigation + Speaker Notes */}
            <div className="no-print bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Ma‘ruzachi izohi (Speaker notes)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safeSlideIdx === 0}
                    onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                    className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    aria-label="Oldingi slayd"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-600 tabular-nums px-2">
                    {safeSlideIdx + 1} / {slides.length}
                  </span>
                  <button
                    type="button"
                    disabled={safeSlideIdx >= slides.length - 1}
                    onClick={() =>
                      setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))
                    }
                    className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    aria-label="Keyingi slayd"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {currentSlide && (
                isEditing ? (
                  <textarea
                    rows={3}
                    value={currentSlide.notes}
                    onChange={(e) => {
                      const next = [...draft.slides];
                      next[safeSlideIdx] = { ...currentSlide, notes: e.target.value };
                      setDraft({ ...draft, slides: next });
                    }}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {currentSlide.notes || "Ushbu slayd uchun qo'shimcha izoh mavjud emas."}
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Academic Paper Mode (Maqola & Referat) */
        <article className="print-document bg-white border border-slate-200 rounded-xl max-w-4xl mx-auto p-8 sm:p-14 font-serif text-slate-900 space-y-8">
          {/* Formal Header / Cover Summary */}
          {draft.format === 'referat' ? (
            <div className="border-b border-slate-200 pb-8 text-center space-y-4">
              <p className="text-xs font-sans uppercase tracking-wider text-slate-500">
                {draft.university} · {draft.faculty}
              </p>
              <p className="text-sm font-sans font-semibold text-blue-900 tracking-wide">
                MUSTAQIL ISH (REFERAT) · {draft.subject.toUpperCase()}
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full text-center text-2xl font-bold px-3 py-2 border border-slate-300 rounded-lg font-sans"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-snug">
                  {draft.title}
                </h1>
              )}
              <p className="text-sm font-sans text-slate-600">
                Bajardi: <strong className="text-slate-900">{draft.studentName}</strong> ({draft.groupName})
              </p>
            </div>
          ) : (
            <div className="border-b border-slate-200 pb-8 space-y-3 text-center">
              <p className="text-xs font-sans font-semibold text-blue-900 tracking-wide uppercase">
                {draft.subject} · Ilmiy maqola
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full text-center text-2xl font-bold px-3 py-2 border border-slate-300 rounded-lg font-sans"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-snug">
                  {draft.title}
                </h1>
              )}
              {draft.subtitle && (
                <p className="text-base italic text-slate-600">{draft.subtitle}</p>
              )}
              <p className="text-sm font-sans text-slate-600 pt-1">
                {draft.studentName} · {draft.university}, {draft.faculty}
              </p>
            </div>
          )}

          {/* Abstract & Keywords */}
          {(draft.abstract || draft.keywords.length > 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3 text-sm leading-relaxed">
              {draft.abstract && (
                <div>
                  <span className="font-sans font-semibold text-slate-900">
                    Annotatsiya:{' '}
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={draft.abstract}
                      onChange={(e) =>
                        setDraft({ ...draft, abstract: e.target.value })
                      }
                      className="mt-1.5 w-full p-2.5 bg-white border border-slate-300 rounded font-serif"
                    />
                  ) : (
                    <span className="text-slate-700">{draft.abstract}</span>
                  )}
                </div>
              )}
              {draft.keywords.length > 0 && (
                <div className="text-xs font-sans text-slate-600">
                  <strong className="text-slate-900">Kalit so‘zlar: </strong>
                  {draft.keywords.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Reja (Table of contents for Referat) */}
          {draft.format === 'referat' && draft.sections.length > 0 && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h2 className="text-base font-sans font-bold text-slate-950 uppercase tracking-wide">
                Reja
              </h2>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 font-sans">
                {draft.sections.map((sec, idx) => (
                  <li key={idx}>{sec.heading}</li>
                ))}
                {draft.references.length > 0 && <li>Foydalanilgan adabiyotlar</li>}
              </ol>
            </div>
          )}

          {/* Body Sections */}
          <div className="space-y-7">
            {draft.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => {
                      const next = [...draft.sections];
                      next[sIdx] = { ...sec, heading: e.target.value };
                      setDraft({ ...draft, sections: next });
                    }}
                    className="w-full px-3 py-1.5 text-lg font-bold font-sans border border-slate-300 rounded"
                  />
                ) : (
                  <h2 className="text-xl font-bold font-sans text-slate-950">
                    {sec.heading}
                  </h2>
                )}

                {sec.paragraphs.map((para, pIdx) =>
                  isEditing ? (
                    <textarea
                      key={pIdx}
                      rows={4}
                      value={para}
                      onChange={(e) => {
                        const nextSections = [...draft.sections];
                        const nextParas = [...sec.paragraphs];
                        nextParas[pIdx] = e.target.value;
                        nextSections[sIdx] = { ...sec, paragraphs: nextParas };
                        setDraft({ ...draft, sections: nextSections });
                      }}
                      className="w-full p-3 text-sm border border-slate-300 rounded-lg leading-relaxed"
                    />
                  ) : (
                    <p
                      key={pIdx}
                      className="text-base leading-[1.75] text-slate-800 text-justify indent-6"
                    >
                      {para}
                    </p>
                  )
                )}
              </div>
            ))}
          </div>

          {/* References */}
          {draft.references.length > 0 && (
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <h2 className="text-lg font-bold font-sans text-slate-950">
                Foydalanilgan adabiyotlar
              </h2>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700 leading-relaxed">
                {draft.references.map((ref, idx) => (
                  <li key={idx}>{ref}</li>
                ))}
              </ol>
            </div>
          )}
        </article>
      )}
    </section>
  );
}
