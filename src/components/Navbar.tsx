import { Compass, Home, Library, PlusCircle, Sun, Moon, User } from 'lucide-react';
import { ACCENT_PRESETS } from '../data/seedCatalog';
import { useMusic } from '../contexts/MusicContext';
import { useTheme } from '../contexts/ThemeContext';
import { NavTab } from '../types/music';

const NAV_ITEMS: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'discover', label: 'Découvrir', icon: Compass },
  { id: 'publish', label: 'Publier', icon: PlusCircle },
  { id: 'library', label: 'Bibliothèque', icon: Library },
  { id: 'profile', label: 'Profil', icon: User },
];

export function Navbar() {
  const { activeTab, setActiveTab, openAlbum } = useMusic();
  const { mode, toggleMode, accentId, setAccentId } = useTheme();

  const handleSelect = (tab: NavTab) => {
    openAlbum(null);
    setActiveTab(tab);
  };

  return (
    <>
      {/* Navigation latérale bureau (md+) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col justify-between border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-5 pt-6 pb-28 select-none">
        <div className="space-y-8">
          <div>
            <button
              type="button"
              onClick={() => handleSelect('home')}
              className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg"
            >
              <span className="font-display text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Musica
              </span>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                La musique à portée de main
              </p>
            </button>
          </div>

          <nav aria-label="Navigation principale" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full min-h-[44px] flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon
                    className="w-5 h-5 shrink-0 transition-colors"
                    style={isActive ? { color: 'var(--accent)' } : undefined}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Personnalisation du thème et de la couleur d'accent */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Apparence
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
                aria-label={mode === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
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
              <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2.5">
                Couleur d’accent
              </span>
              <div className="flex items-center gap-2.5" role="radiogroup" aria-label="Couleur d'accent">
                {ACCENT_PRESETS.map((preset) => {
                  const isSelected = accentId === preset.id;
                  const swatchHex = mode === 'dark' ? preset.hex : preset.lightHex;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={preset.label}
                      title={preset.label}
                      onClick={() => setAccentId(preset.id)}
                      className={`w-7 h-7 rounded-full transition-transform duration-150 flex items-center justify-center border ${
                        isSelected
                          ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 ring-zinc-900 dark:ring-white border-transparent'
                          : 'border-zinc-300 dark:border-zinc-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatchHex }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mention droits d'auteur */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            100 % gratuit et sans abonnement
          </p>
          <p>
            Publiez uniquement les œuvres dont vous détenez les droits.
          </p>
        </div>
      </aside>

      {/* Navigation fixe en bas sur mobile (< md) */}
      <nav
        aria-label="Navigation mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-5 items-center"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 transition-colors focus-visible:outline-none"
            >
              <Icon
                className="w-5 h-5 transition-colors"
                style={isActive ? { color: 'var(--accent)' } : undefined}
                strokeWidth={isActive ? 2.4 : 1.8}
                aria-hidden="true"
              />
              <span
                className={`text-[10px] leading-none whitespace-nowrap truncate max-w-full ${
                  isActive
                    ? 'font-semibold text-zinc-950 dark:text-white'
                    : 'font-medium text-zinc-500 dark:text-zinc-400'
                }`}
                style={isActive ? { color: 'var(--accent)' } : undefined}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
