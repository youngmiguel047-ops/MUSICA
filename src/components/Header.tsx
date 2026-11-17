import { LogIn, Moon, Palette, Sun } from 'lucide-react';
import { useState } from 'react';
import { ACCENT_PRESETS } from '../data/seedCatalog';
import { useMusic } from '../contexts/MusicContext';
import { useTheme } from '../contexts/ThemeContext';
import { CoverImage } from './CoverImage';

export function Header() {
  const { currentUser, setAuthModalOpen, setActiveTab } = useMusic();
  const { mode, toggleMode, accentId, setAccentId } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <header className="relative z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md">
      {/* Zone 1 : Marque sur mobile / Titre contextuel sur desktop */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="md:hidden font-display text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white whitespace-nowrap shrink-0"
        >
          Musica
        </button>
        <span className="hidden md:inline-block text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap shrink-0">
          Streaming & Publication libre
        </span>
      </div>

      {/* Zone 2 : Contrôles rapides Thème (mobile) & Action Authentification */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Sélecteur rapide de thème sur mobile (sur desktop il est déjà dans la barre latérale) */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => setThemeOpen((prev) => !prev)}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Personnaliser le thème"
          >
            <Palette className="w-4 h-4" aria-hidden="true" />
          </button>

          {themeOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setThemeOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-56 z-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Mode d’affichage
                  </span>
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    {mode === 'dark' ? (
                      <>
                        <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Clair</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Sombre</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                    Couleur d’accent
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    {ACCENT_PRESETS.map((preset) => {
                      const active = accentId === preset.id;
                      const hex = mode === 'dark' ? preset.hex : preset.lightHex;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAccentId(preset.id)}
                          aria-label={preset.label}
                          className={`w-7 h-7 rounded-full border transition-transform ${
                            active
                              ? 'scale-110 ring-2 ring-zinc-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 border-transparent'
                              : 'border-zinc-300 dark:border-zinc-700'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {currentUser ? (
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="min-h-[40px] flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
          >
            <CoverImage
              src={currentUser.avatarUrl}
              alt={currentUser.artistName}
              className="w-7 h-7 rounded-lg shrink-0"
            />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 max-w-[120px] truncate">
              {currentUser.artistName}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-transform active:scale-[0.98] whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
            }}
          >
            <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Se connecter</span>
          </button>
        )}
      </div>
    </header>
  );
}
