import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ACCENT_PRESETS } from '../data/seedCatalog';
import { AccentColorId, AccentPreset, ThemeMode } from '../types/music';

interface ThemeContextValue {
  mode: ThemeMode;
  accentId: AccentColorId;
  accent: AccentPreset;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setAccentId: (id: AccentColorId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_MODE_KEY = 'musica_theme_mode_v1';
const ACCENT_ID_KEY = 'musica_accent_id_v1';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_MODE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accentId, setAccentIdState] = useState<AccentColorId>(() => {
    try {
      const saved = localStorage.getItem(ACCENT_ID_KEY) as AccentColorId | null;
      return ACCENT_PRESETS.some((p) => p.id === saved) ? saved! : 'green';
    } catch {
      return 'green';
    }
  });

  const accent = useMemo(
    () => ACCENT_PRESETS.find((p) => p.id === accentId) ?? ACCENT_PRESETS[0],
    [accentId]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const activeHex = mode === 'dark' ? accent.hex : accent.lightHex;
    const hoverHex = mode === 'dark' ? accent.hoverHex : accent.lightHoverHex;
    const fgHex = mode === 'dark' ? accent.darkForeground : accent.lightForeground;

    root.style.setProperty('--accent', activeHex);
    root.style.setProperty('--accent-hover', hoverHex);
    root.style.setProperty('--accent-foreground', fgHex);
    root.style.setProperty('--accent-soft', accent.softBg);

    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
      localStorage.setItem(ACCENT_ID_KEY, accentId);
    } catch {
      // Ignore storage errors
    }
  }, [mode, accent, accentId]);

  const toggleMode = () => setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const setMode = (next: ThemeMode) => setModeState(next);
  const setAccentId = (id: AccentColorId) => setAccentIdState(id);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accentId,
        accent,
        toggleMode,
        setMode,
        setAccentId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans un ThemeProvider.');
  return ctx;
}
