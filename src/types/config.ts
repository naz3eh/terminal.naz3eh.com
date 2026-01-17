export interface SocialLinks {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  instagram: string;
}

export interface Project {
  name: string;
  description: string;
  link: string;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  prompt: string;
  accent: string;
  error: string;
  link: string;
}

export interface Config {
  ascii: string[];
  title: string;
  name: string;
  username: string;
  hostname: string;
  password: string;
  repo: string;
  social: SocialLinks;
  about: string;
  projects: Project[];
  colors: ThemeColors;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'ascii' | 'link';
  content: string;
  prompt?: string;
  href?: string;
}

export type ThemeName = 'default' | 'matrix' | 'cyberpunk' | 'dracula' | 'solarized' | 'amber';
