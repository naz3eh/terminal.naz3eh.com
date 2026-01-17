import { useState, useEffect, useRef, useCallback } from 'react';
import type { Config, TerminalLine, ThemeName } from '../types/config';
import { executeCommand } from '../commands';
import { getTheme } from '../themes';

interface TerminalProps {
  config: Config;
}

export const Terminal = ({ config }: TerminalProps) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('terminal-theme');
    return (saved as ThemeName) || 'default';
  });
  const [hackerMode, setHackerMode] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [booted, setBooted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  const currentColors = getTheme(theme, config.colors);

  // Apply theme colors as CSS variables
  useEffect(() => {
    const colors = hackerMode
      ? {
          background: '#000000',
          foreground: '#00ff00',
          prompt: '#ff0000',
          accent: '#ff00ff',
          error: '#ff0000',
          link: '#00ffff',
        }
      : currentColors;

    document.documentElement.style.setProperty('--color-background', colors.background);
    document.documentElement.style.setProperty('--color-foreground', colors.foreground);
    document.documentElement.style.setProperty('--color-prompt', colors.prompt);
    document.documentElement.style.setProperty('--color-accent', colors.accent);
    document.documentElement.style.setProperty('--color-error', colors.error);
    document.documentElement.style.setProperty('--color-link', colors.link);
  }, [theme, hackerMode, currentColors]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('terminal-theme', theme);
  }, [theme]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Add lines with animation
  const addLinesAnimated = useCallback(async (newLines: TerminalLine[]) => {
    cancelRef.current = false;
    setIsTyping(true);

    for (const line of newLines) {
      if (cancelRef.current) break;
      setLines((prev) => [...prev, line]);
      await new Promise((resolve) => setTimeout(resolve, 35));
    }

    setIsTyping(false);
  }, []);

  // Boot sequence
  useEffect(() => {
    if (booted) return;

    const bootMessages: TerminalLine[] = [
      { id: 'boot-1', type: 'system', content: 'Initializing terminal...' },
      { id: 'boot-2', type: 'system', content: 'Loading configuration...' },
      { id: 'boot-3', type: 'system', content: 'Establishing connection...' },
      { id: 'boot-4', type: 'system', content: `Connected to ${config.hostname}` },
      { id: 'boot-5', type: 'output', content: '' },
    ];

    const bannerLines: TerminalLine[] = [
      ...config.ascii.map((line, i) => ({
        id: `ascii-${i}`,
        type: 'ascii' as const,
        content: line,
      })),
      { id: 'welcome-1', type: 'output', content: '' },
      { id: 'welcome-2', type: 'output', content: `Welcome to ${config.name}'s terminal portfolio` },
      { id: 'welcome-3', type: 'output', content: 'Type "help" to see available commands.' },
      { id: 'welcome-4', type: 'output', content: '' },
    ];

    const runBoot = async () => {
      await addLinesAnimated(bootMessages);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await addLinesAnimated(bannerLines);
      setBooted(true);
      inputRef.current?.focus();
    };

    runBoot();
  }, [config, booted, addLinesAnimated]);

  const handleSubmit = async () => {
    if (isTyping) {
      cancelRef.current = true;
      return;
    }

    const prompt = `${config.username}@${config.hostname}:~$`;
    const inputLine: TerminalLine = {
      id: `input-${Date.now()}`,
      type: 'input',
      content: input,
      prompt,
    };

    setLines((prev) => [...prev, inputLine]);

    if (input.trim()) {
      setHistory((prev) => [...prev, input]);
    }
    setHistoryIndex(-1);

    const result = executeCommand(
      input,
      config,
      theme,
      setTheme,
      hackerMode,
      setHackerMode,
      failedAttempts,
      setFailedAttempts
    );

    setInput('');

    if (result.action === 'clear') {
      setLines([]);
      return;
    }

    if (result.action === 'rickroll') {
      await addLinesAnimated(result.lines);
      setTimeout(() => {
        window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      }, 1500);
      return;
    }

    if (result.action === 'hacker-mode') {
      setHackerMode(true);
    }

    await addLinesAnimated(result.lines);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      cancelRef.current = true;
      setInput('');
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const renderLine = (line: TerminalLine) => {
    switch (line.type) {
      case 'input':
        return (
          <div key={line.id} className="terminal-line input-line">
            <span className="prompt">{line.prompt}</span>
            <span className="command">{line.content}</span>
          </div>
        );
      case 'output':
        return (
          <div key={line.id} className="terminal-line output-line">
            {line.content}
          </div>
        );
      case 'error':
        return (
          <div key={line.id} className="terminal-line error-line">
            {line.content}
          </div>
        );
      case 'system':
        return (
          <div key={line.id} className="terminal-line system-line">
            {line.content}
          </div>
        );
      case 'ascii':
        return (
          <div key={line.id} className="terminal-line ascii-line">
            {line.content}
          </div>
        );
      case 'link':
        return (
          <div key={line.id} className="terminal-line link-line">
            <a href={line.href} target="_blank" rel="noopener noreferrer">
              {line.content}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  const prompt = `${config.username}@${config.hostname}:~$`;

  return (
    <div className={`terminal-container ${hackerMode ? 'hacker-mode' : ''}`} onClick={focusInput}>
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="btn close"></span>
          <span className="btn minimize"></span>
          <span className="btn maximize"></span>
        </div>
        <div className="terminal-title">{config.title}</div>
        <div className="terminal-spacer"></div>
      </div>
      <div className="terminal-body" ref={terminalRef}>
        {lines.map(renderLine)}
        <div className="terminal-line input-line current">
          <span className="prompt">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <span className="cursor"></span>
        </div>
      </div>
      {hackerMode && <div className="scanlines"></div>}
      {hackerMode && <div className="crt-effect"></div>}
    </div>
  );
};
