export type ActiveTab = 'create' | 'archive' | 'profile';

interface TopBarProps {
  isSignedIn: boolean;
  hasProfile: boolean;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
  isBusy?: boolean;
}

export function TopBar({
  isSignedIn,
  hasProfile,
  activeTab,
  onSelectTab,
  onPrimaryAction,
  primaryActionLabel,
  isBusy = false,
}: TopBarProps) {
  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (isSignedIn && hasProfile) {
              onSelectTab('create');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-xl font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
        >
          IlmNoma
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        {isSignedIn && hasProfile ? (
          <nav
            aria-label="Asosiy menyu"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => onSelectTab('create')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'create'
                  ? 'border-blue-900 text-slate-950'
                  : 'border-transparent text-slate-600 hover:text-slate-950'
              }`}
            >
              Ish yaratish
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('archive')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'archive'
                  ? 'border-blue-900 text-slate-950'
                  : 'border-transparent text-slate-600 hover:text-slate-950'
              }`}
            >
              Mening ishlarim
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-900 text-slate-950'
                  : 'border-transparent text-slate-600 hover:text-slate-950'
              }`}
            >
              Talaba profili
            </button>
          </nav>
        ) : (
          <nav
            aria-label="Tanishuv menyusi"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#formatlar"
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              Formatlar
            </a>
            <a
              href="#qanday-ishlaydi"
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              Qanday ishlaydi
            </a>
            <a
              href="#afzalliklar"
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              Imkoniyatlar
            </a>
          </nav>
        )}

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            disabled={isBusy}
            onClick={onPrimaryAction}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>

      {/* Mobile secondary bar (compact, <= 44px) */}
      {isSignedIn && hasProfile && (
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center justify-around gap-2 bg-white">
          <button
            type="button"
            onClick={() => onSelectTab('create')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'create'
                ? 'bg-blue-900 text-white'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Ish yaratish
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('archive')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'archive'
                ? 'bg-blue-900 text-white'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Mening ishlarim
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'profile'
                ? 'bg-blue-900 text-white'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Profil
          </button>
        </div>
      )}
    </header>
  );
}
