import { useState } from 'react';
import { BookOpen, FileText, Presentation, ArrowRight } from 'lucide-react';

interface LandingViewProps {
  onGoogleSignIn: () => void;
  isSigningIn: boolean;
  authError: string | null;
}

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
}

function ImageWithFallback({ src, alt, fallbackTitle, className = '' }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        <BookOpen className="w-8 h-8 text-slate-500 mb-2" />
        <span className="text-xs font-medium text-slate-600">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

const FORMAT_SHOWCASE = [
  {
    id: 'maqola',
    title: 'Ilmiy maqola',
    meta: 'IMRAD tuzilma · .docx format',
    description:
      "Annotatsiya, kalit so'zlar, kirish, tahliliy bo'limlar va adabiyotlar ro'yxatiga ega ilmiy maqola shaklida.",
    image: '/src/assets/images/format_maqola_preview_1795496930536.jpg',
    icon: BookOpen,
  },
  {
    id: 'taqdimot',
    title: 'Taqdimot (Slaydlar)',
    meta: "16:9 slaydlar · .pptx format",
    description:
      "Seminar va himoya uchun sarlavha, reja, asosiy tezislar va ma'ruzachi izohlari bilan tayyor PowerPoint slaydlar.",
    image: '/src/assets/images/format_taqdimot_preview_1795496931342.jpg',
    icon: Presentation,
  },
  {
    id: 'referat',
    title: 'Referat',
    meta: 'Titul varaq + boblar · .docx format',
    description:
      "OTM, fakultet va talaba ma'lumotlari tushirilgan rasmiy titul varag'i, reja va boblarga bo'lingan to'liq matn.",
    image: '/src/assets/images/format_referat_preview_1795496931061.jpg',
    icon: FileText,
  },
];

export function LandingView({
  onGoogleSignIn,
  isSigningIn,
  authError,
}: LandingViewProps) {
  return (
    <main id="top" className="max-w-7xl mx-auto px-6 py-12 lg:py-16 space-y-20">
      {/* 2-Column Balanced Split Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between py-2">
          <div>
            <p className="text-xs font-medium text-blue-900 tracking-wide">
              Talabalar uchun aqlli akademik ustaxona
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-950 leading-[1.14] text-balance">
              Mustaqil ishlarni kerakli formatda tez va tartibli tayyorlang
            </h1>
            <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
              Avval talaba profilini ro‘yxatdan o‘tkazing, so‘ng fan va mavzuni kiriting. Har bir fan talabiga mos ravishda{' '}
              <strong className="font-semibold text-slate-900">Maqola</strong>,{' '}
              <strong className="font-semibold text-slate-900">Taqdimot</strong> yoki{' '}
              <strong className="font-semibold text-slate-900">Referat</strong> shaklida tahrirlab, tayyor fayl sifatida yuklab oling.
            </p>

            {authError && (
              <div
                role="alert"
                className="mt-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
              >
                {authError}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={isSigningIn}
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                <span>
                  {isSigningIn
                    ? 'Kirilmoqda...'
                    : "Google orqali ro'yxatdan o'tish"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#formatlar"
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
              >
                Formatlar bilan tanishish
              </a>
            </div>
          </div>

          {/* Quiet factual summary strip */}
          <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 gap-6">
            <div>
              <div className="text-lg font-semibold text-slate-950 tabular-nums">3 xil</div>
              <div className="mt-0.5 text-xs text-slate-500">Akademik format</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-950">.docx / .pptx</div>
              <div className="mt-0.5 text-xs text-slate-500">To‘g‘ridan-to‘g‘ri yuklash</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-950">O‘z / En / Ru</div>
              <div className="mt-0.5 text-xs text-slate-50">Uch tilda tayyorlash</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-full min-h-[320px] rounded-xl overflow-hidden border border-slate-200 bg-white">
            <ImageWithFallback
              src="/src/assets/images/hero_academic_study_1795496930169.jpg"
              alt="Talaba ish stoli va o'quv materiallari"
              fallbackTitle="Talaba akademik ish maydoni"
              className="w-full h-full lg:h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Format Showcase Section */}
      <section id="formatlar" className="pt-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 text-balance">
            Har bir fan talabiga mos uchta shakl
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            O‘qituvchi yoki kafedra talabiga qarab mustaqil ishni kerakli formatda tanlang va bir klikda yuklab oling.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {FORMAT_SHOWCASE.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    fallbackTitle={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon className="w-3.5 h-3.5 text-blue-900" />
                    <span>{item.meta}</span>
                  </div>
                  <h3 className="mt-2.5 text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Workflow Steps */}
      <section
        id="qanday-ishlaydi"
        className="bg-white border border-slate-200 rounded-xl p-8 lg:p-10"
      >
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Ishlash tartibi
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="text-xs font-mono font-medium text-blue-900 tabular-nums">
              01-qadam
            </div>
            <h3 className="text-base font-semibold text-slate-950">
              Talaba registratsiyasi
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Google hisobingiz bilan kiring va OTM, fakultet, guruh hamda F.I.O. ma‘lumotlaringizni kiriting. Bu ma‘lumotlar titul varag‘iga avtomatik yoziladi.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono font-medium text-blue-900 tabular-nums">
              02-qadam
            </div>
            <h3 className="text-base font-semibold text-slate-950">
              Format va mavzu tanlash
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fan nomi, mavzu, til va kerakli shakl (Maqola, Taqdimot yoki Referat)ni tanlang. Tizim akademik standartda reja va matnni shakllantiradi.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono font-medium text-blue-900 tabular-nums">
              03-qadam
            </div>
            <h3 className="text-base font-semibold text-slate-950">
              Ko‘rib chiqish va yuklab olish
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tayyor ishni saytning o‘zida tahrirlang, slaydlarni ko‘zdan kechiring va Word (.docx), PowerPoint (.pptx) yoki PDF shaklida yuklab oling.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities summary */}
      <section id="afzalliklar" className="pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 pt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Smart talabalar uchun qulay ish muhiti
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-md">
              Barcha mustaqil ishlaringiz shaxsiy arxivda saqlanadi. Istalgan vaqtda fan yoki mavzu bo‘yicha topib, qayta tahrirlash va yuklab olish mumkin.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-slate-950">Avtomatik titul varaq</h3>
              <p className="mt-1 text-slate-600">
                Ro‘yxatdan o‘tgan talaba va universitet ma‘lumotlari hujjat boshiga joylanadi.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Ma‘ruzachi izohlari</h3>
              <p className="mt-1 text-slate-600">
                Har bir taqdimot slaydi himoyada gapirish uchun qisqa nutq matni bilan keladi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
