import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const colors = theme === 'dark' ? {
    bg:       '#0a0f1e',
    bg2:      '#111827',
    bg3:      '#1e293b',
    border:   'rgba(255,255,255,0.08)',
    text:     '#ffffff',
    textMuted:'#94a3b8',
    textDim:  '#64748b',
    accent:   '#ff004f',
    green:    '#10b981',
    navBg:    'rgba(10,15,30,0.95)',
  } : {
    bg:       '#f1f5f9',
    bg2:      '#ffffff',
    bg3:      '#e2e8f0',
    border:   'rgba(0,0,0,0.08)',
    text:     '#0f172a',
    textMuted:'#475569',
    textDim:  '#94a3b8',
    accent:   '#ff004f',
    green:    '#059669',
    navBg:    'rgba(255,255,255,0.95)',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);