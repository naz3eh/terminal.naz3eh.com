import type { Config, TerminalLine, ThemeName } from '../types/config';
import { themeNames } from '../themes';

export interface CommandResult {
  lines: TerminalLine[];
  action?: 'clear' | 'rickroll' | 'hacker-mode';
}

type CommandHandler = (
  args: string[],
  config: Config,
  currentTheme: ThemeName,
  setTheme: (theme: ThemeName) => void,
  hackerMode: boolean,
  setHackerMode: (mode: boolean) => void,
  failedAttempts: number,
  setFailedAttempts: (n: number) => void
) => CommandResult;

let lineId = 0;
const createLine = (
  type: TerminalLine['type'],
  content: string,
  href?: string
): TerminalLine => ({
  id: `line-${lineId++}`,
  type,
  content,
  href,
});

const helpCommand: CommandHandler = () => ({
  lines: [
    createLine('output', ''),
    createLine('output', 'Available commands:'),
    createLine('output', ''),
    createLine('output', '  help        - Show this help message'),
    createLine('output', '  banner      - Display the ASCII banner'),
    createLine('output', '  about       - Learn more about me'),
    createLine('output', '  projects    - View my projects'),
    createLine('output', '  social      - Get my social links'),
    createLine('output', '  whoami      - Display current user'),
    createLine('output', '  ls          - List available files'),
    createLine('output', '  cat <file>  - View file contents'),
    createLine('output', '  theme       - List or change themes'),
    createLine('output', '  repo        - View source code'),
    createLine('output', '  clear       - Clear the terminal'),
    createLine('output', '  exit        - Close terminal'),
    createLine('output', ''),
  ],
});

const bannerCommand: CommandHandler = (_args, config) => ({
  lines: [
    createLine('output', ''),
    ...config.ascii.map((line) => createLine('ascii', line)),
    createLine('output', ''),
    createLine('output', `Welcome to ${config.name}'s terminal portfolio`),
    createLine('output', 'Type "help" to see available commands.'),
    createLine('output', ''),
  ],
});

const aboutCommand: CommandHandler = (_args, config) => ({
  lines: [
    createLine('output', ''),
    createLine('output', config.about),
    createLine('output', ''),
  ],
});

const projectsCommand: CommandHandler = (_args, config) => ({
  lines: [
    createLine('output', ''),
    createLine('output', 'My Projects:'),
    createLine('output', ''),
    ...config.projects.flatMap((project, i) => [
      createLine('output', `  ${i + 1}. ${project.name}`),
      createLine('output', `     ${project.description}`),
      createLine('link', project.link, project.link),
      createLine('output', ''),
    ]),
  ],
});

const socialCommand: CommandHandler = (_args, config) => ({
  lines: [
    createLine('output', ''),
    createLine('output', 'Find me online:'),
    createLine('output', ''),
    createLine('social', `Email:     |${config.social.email}`, `mailto:${config.social.email}`),
    createLine('social', `GitHub:    |github.com/${config.social.github}`, `https://github.com/${config.social.github}`),
    createLine('social', `Twitter:   |x.com/${config.social.twitter}`, `https://x.com/${config.social.twitter}`),
    createLine('social', `YouTube:   |youtube.com/@${config.social.youtube}`, `https://youtube.com/@${config.social.youtube}`),
    createLine('social', `Instagram: |instagram.com/${config.social.instagram}`, `https://instagram.com/${config.social.instagram}`),
    createLine('social', `LinkedIn:  |linkedin.com/in/${config.social.linkedin}`, `https://linkedin.com/in/${config.social.linkedin}`),
    createLine('output', ''),
  ],
});

const whoamiCommand: CommandHandler = (_args, config) => ({
  lines: [createLine('output', config.username)],
});

const lsCommand: CommandHandler = () => ({
  lines: [
    createLine('output', ''),
    createLine('output', 'about.txt    projects.txt    social.txt'),
    createLine('output', 'github       linkedin        email'),
    createLine('output', 'twitter      youtube         instagram'),
    createLine('output', ''),
  ],
});

const catCommand: CommandHandler = (args, config) => {
  const file = args[0]?.toLowerCase();

  if (!file) {
    return {
      lines: [createLine('error', 'Usage: cat <filename>')],
    };
  }

  const fileMap: Record<string, () => CommandResult> = {
    'about.txt': () => aboutCommand([], config, 'default', () => {}, false, () => {}, 0, () => {}),
    'projects.txt': () => projectsCommand([], config, 'default', () => {}, false, () => {}, 0, () => {}),
    'social.txt': () => socialCommand([], config, 'default', () => {}, false, () => {}, 0, () => {}),
    github: () => ({
      lines: [createLine('system', `Opening GitHub...`)],
      action: undefined,
    }),
    linkedin: () => ({
      lines: [createLine('system', `Opening LinkedIn...`)],
    }),
    twitter: () => ({
      lines: [createLine('system', `Opening Twitter...`)],
    }),
    youtube: () => ({
      lines: [createLine('system', `Opening YouTube...`)],
    }),
    instagram: () => ({
      lines: [createLine('system', `Opening Instagram...`)],
    }),
    email: () => ({
      lines: [createLine('system', `Opening email client...`)],
    }),
  };

  if (fileMap[file]) {
    const result = fileMap[file]();

    // Open URLs for social links
    if (['github', 'linkedin', 'twitter', 'youtube', 'instagram'].includes(file)) {
      const urls: Record<string, string> = {
        github: `https://github.com/${config.social.github}`,
        linkedin: `https://linkedin.com/in/${config.social.linkedin}`,
        twitter: `https://x.com/${config.social.twitter}`,
        youtube: `https://youtube.com/@${config.social.youtube}`,
        instagram: `https://instagram.com/${config.social.instagram}`,
      };
      window.open(urls[file], '_blank');
    } else if (file === 'email') {
      window.open(`mailto:${config.social.email}`, '_blank');
    }

    return result;
  }

  // Check if it's a project name or index
  const projectIndex = parseInt(file) - 1;
  const project = config.projects[projectIndex] ||
    config.projects.find(p => p.name.toLowerCase().includes(file));

  if (project) {
    window.open(project.link, '_blank');
    return {
      lines: [createLine('system', `Opening ${project.name}...`)],
    };
  }

  return {
    lines: [createLine('error', `cat: ${file}: No such file or directory`)],
  };
};

const themeCommand: CommandHandler = (args, _config, currentTheme, setTheme) => {
  const themeName = args[0]?.toLowerCase() as ThemeName | undefined;

  if (!themeName) {
    return {
      lines: [
        createLine('output', ''),
        createLine('output', 'Available themes:'),
        createLine('output', ''),
        ...themeNames.map((name) =>
          createLine('output', `  ${name === currentTheme ? '> ' : '  '}${name}`)
        ),
        createLine('output', ''),
        createLine('output', 'Usage: theme <name>'),
        createLine('output', ''),
      ],
    };
  }

  if (!themeNames.includes(themeName)) {
    return {
      lines: [createLine('error', `Theme "${themeName}" not found. Type "theme" to see available themes.`)],
    };
  }

  setTheme(themeName);
  return {
    lines: [createLine('system', `Theme changed to "${themeName}"`)],
  };
};

const repoCommand: CommandHandler = (_args, config) => {
  window.open(config.repo, '_blank');
  return {
    lines: [createLine('system', 'Opening repository...')],
  };
};

const clearCommand: CommandHandler = () => ({
  lines: [],
  action: 'clear',
});

const exitCommand: CommandHandler = () => ({
  lines: [createLine('system', 'Goodbye! Redirecting...')],
  action: 'rickroll',
});

const sudoCommand: CommandHandler = (
  args,
  config,
  _currentTheme,
  _setTheme,
  _hackerMode,
  setHackerMode,
  failedAttempts,
  setFailedAttempts
) => {
  const password = args[0];

  if (!password) {
    return {
      lines: [createLine('error', 'Usage: sudo <password>')],
    };
  }

  if (password === config.password) {
    setHackerMode(true);
    setFailedAttempts(0);
    return {
      lines: [
        createLine('system', 'Access granted. Hacker mode activated.'),
        createLine('ascii', ''),
        createLine('ascii', '  ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ '),
        createLine('ascii', '  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗'),
        createLine('ascii', '  ███████║███████║██║     █████╔╝ █████╗  ██████╔╝'),
        createLine('ascii', '  ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗'),
        createLine('ascii', '  ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║'),
        createLine('ascii', '  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝'),
        createLine('ascii', ''),
      ],
      action: 'hacker-mode',
    };
  }

  const newAttempts = failedAttempts + 1;
  setFailedAttempts(newAttempts);

  const messages = [
    'Access denied. Nice try though.',
    'Still wrong. Maybe try "password123"? Just kidding.',
    'Nope. Are you even trying?',
    'Wrong again. I admire your persistence.',
    'Access denied. Have you considered a career in something other than hacking?',
  ];

  return {
    lines: [
      createLine('error', messages[Math.min(newAttempts - 1, messages.length - 1)]),
    ],
  };
};

const commands: Record<string, CommandHandler> = {
  help: helpCommand,
  banner: bannerCommand,
  about: aboutCommand,
  projects: projectsCommand,
  social: socialCommand,
  whoami: whoamiCommand,
  ls: lsCommand,
  cat: catCommand,
  theme: themeCommand,
  repo: repoCommand,
  clear: clearCommand,
  exit: exitCommand,
  sudo: sudoCommand,
};

export const executeCommand = (
  input: string,
  config: Config,
  currentTheme: ThemeName,
  setTheme: (theme: ThemeName) => void,
  hackerMode: boolean,
  setHackerMode: (mode: boolean) => void,
  failedAttempts: number,
  setFailedAttempts: (n: number) => void
): CommandResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    return { lines: [] };
  }

  const [cmd, ...args] = trimmed.split(/\s+/);
  const command = cmd.toLowerCase();
  const handler = commands[command];

  if (!handler) {
    return {
      lines: [
        createLine('error', `Command not found: ${command}`),
        createLine('output', 'Type "help" to see available commands.'),
      ],
    };
  }

  return handler(
    args,
    config,
    currentTheme,
    setTheme,
    hackerMode,
    setHackerMode,
    failedAttempts,
    setFailedAttempts
  );
};
