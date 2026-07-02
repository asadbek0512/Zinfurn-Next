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
const getAppliedMode = (): ThemeMode => {
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
};

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
	// SSR har doim light bilan render bo'ladi; haqiqiy mode mount'dan KEYIN state'ga o'tadi —
	// aks holda hydration eski (light) MUI style'larini muzlatib qo'yadi.
	// data-theme atributi esa no-flash script tomonidan allaqachon qo'yilgan, unga tegilmaydi.
	const [mode, setMode] = useState<ThemeMode>('light');

	useEffect(() => {
		setMode(getAppliedMode());
	}, []);

	const toggleMode = useCallback(() => {
		setMode((prev) => {
			const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
			localStorage.setItem(THEME_STORAGE_KEY, next);
			document.documentElement.dataset.theme = next;
			return next;
		});
	}, []);

	return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => useContext(ThemeContext);
