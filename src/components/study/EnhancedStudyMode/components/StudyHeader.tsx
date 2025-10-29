interface StudyHeaderProps {
  viewMode: 'explore' | 'quiz' | 'map' | 'timeline' | 'formation';
  onViewModeChange: (mode: 'explore' | 'quiz' | 'map' | 'timeline' | 'formation') => void;
  progress: {
    studiedCounties: Set<string>;
  };
  onClose: () => void;
  isMobile: boolean;
}

export default function StudyHeader({
  viewMode,
  onViewModeChange,
  progress,
  onClose,
  isMobile: _isMobile,
}: StudyHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden flex-shrink-0">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* Main Header Content */}
      <div className="relative">
        {/* Ultra-Compact Top Bar */}
        <div className="px-4 sm:px-6 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/10 backdrop-blur-sm border border-white/20 text-xs">
              📚
            </span>
            <h1 className="text-sm font-bold tracking-tight text-white">
              California Counties Study Mode
            </h1>
            <span className="hidden sm:inline text-xs text-blue-200/60">
              • Master all 58 counties
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Ultra-Compact Progress */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2 py-0.5 flex items-center gap-1.5">
              <div className="relative w-6 h-6">
                <svg className="transform -rotate-90 w-6 h-6">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-white/20"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${(progress.studiedCounties.size / 58) * 63} 63`}
                    className="text-blue-400 transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                  {Math.round((progress.studiedCounties.size / 58) * 100)}%
                </span>
              </div>
              <div className="text-xs">
                <span className="font-semibold">{progress.studiedCounties.size}</span>
                <span className="text-blue-200/70">/58</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              aria-label="Close Study Mode"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Compact Design */}
        <div className="px-4 sm:px-6 pb-1">
          <nav className="flex gap-1 p-0.5 bg-black/20 backdrop-blur-sm rounded-lg overflow-x-auto">
            {[
              { mode: 'explore' as const, icon: '📚', label: 'Explore' },
              { mode: 'quiz' as const, icon: '🎯', label: 'Quiz' },
              { mode: 'map' as const, icon: '🗺️', label: 'Map' },
              { mode: 'timeline' as const, icon: '📅', label: 'Timeline' },
              { mode: 'formation' as const, icon: '🎬', label: 'Formation' },
            ].map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`
                  relative flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md
                  font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap min-w-[70px]
                  ${
                    viewMode === mode
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="text-sm sm:text-base">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.slice(0, 3)}</span>
                {viewMode === mode && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full hidden sm:block">
                    <div className="w-2 h-2 bg-white transform rotate-45 -mt-1"></div>
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
