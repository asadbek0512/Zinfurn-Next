import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

interface ThemeContextValue {
	mode: ThemeMode;
	toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
	mode: 'light',
	toggleMode: () => {},
});

/** Reads the mode already applied by the no-flash script in _document.tsx */
const getInitialMode = (): ThemeMode => {
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
};

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setMode] = useState<ThemeMode>(getInitialMode);

	useEffect(() => {
		document.documentElement.dataset.theme = mode;
	}, [mode]);

	const toggleMode = useCallback(() => {
		setMode((prev) => {
			const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
			localStorage.setItem(THEME_STORAGE_KEY, next);
			return next;
		});
	}, []);

	return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => useContext(ThemeContext);
