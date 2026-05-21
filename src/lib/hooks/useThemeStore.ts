import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('tasker-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return null;
}

function getOsTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  setTheme: (theme: Theme) => {
    set({ theme });
    applyTheme(theme);
    try { localStorage.setItem('tasker-theme', theme); } catch {}
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },

  initTheme: () => {
    const stored = getStoredTheme();
    const theme = stored ?? getOsTheme();
    set({ theme });
    applyTheme(theme);

    if (!stored) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (!getStoredTheme()) {
          const t = e.matches ? 'dark' : 'light';
          set({ theme: t });
          applyTheme(t);
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  },
}));
