import type { ThemeColors, ThemeName } from './types/config';

export const themes: Record<Exclude<ThemeName, 'default'>, ThemeColors> = {
  matrix: {
    background: '#0a0a0a',
    foreground: '#00ff00',
    prompt: '#00ff00',
    accent: '#00cc00',
    error: '#ff0000',
    link: '#00ff66',
  },
  cyberpunk: {
    background: '#0a0014',
    foreground: '#00ffff',
    prompt: '#ff00ff',
    accent: '#ffff00',
    error: '#ff0055',
    link: '#00ffff',
  },
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    prompt: '#50fa7b',
    accent: '#bd93f9',
    error: '#ff5555',
    link: '#8be9fd',
  },
  solarized: {
    background: '#002b36',
    foreground: '#839496',
    prompt: '#859900',
    accent: '#268bd2',
    error: '#dc322f',
    link: '#2aa198',
  },
  amber: {
    background: '#1a1200',
    foreground: '#ffb000',
    prompt: '#ffb000',
    accent: '#ff8c00',
    error: '#ff4400',
    link: '#ffd700',
  },
};

export const getTheme = (name: ThemeName, defaultColors: ThemeColors): ThemeColors => {
  if (name === 'default') return defaultColors;
  return themes[name];
};

export const themeNames: ThemeName[] = ['default', 'matrix', 'cyberpunk', 'dracula', 'solarized', 'amber'];
