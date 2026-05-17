import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Currency = 'USD' | 'KRW' | 'UZS';

interface Rates {
	USD: number;
	KRW: number;
	UZS: number;
}

interface CurrencyContextType {
	currency: Currency;
	setCurrency: (c: Currency) => void;
	formatPrice: (usdAmount: number | undefined) => string;
	rates: Rates;
}

const DEFAULT_RATES: Rates = { USD: 1, KRW: 1350, UZS: 12700 };
const STORAGE_KEY = 'zf_currency';
const RATES_CACHE_KEY = 'zf_rates_cache';
const RATES_TTL = 60 * 60 * 1000; // 1 hour

const CurrencyContext = createContext<CurrencyContextType>({
	currency: 'KRW',
	setCurrency: () => {},
	formatPrice: () => '',
	rates: DEFAULT_RATES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
	const [currency, setCurrencyState] = useState<Currency>('KRW');
	const [rates, setRates] = useState<Rates>(DEFAULT_RATES);

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
		if (saved && ['USD', 'KRW', 'UZS'].includes(saved)) {
			setCurrencyState(saved);
		}

		const cached = localStorage.getItem(RATES_CACHE_KEY);
		if (cached) {
			try {
				const { timestamp, data } = JSON.parse(cached);
				if (Date.now() - timestamp < RATES_TTL) {
					setRates(data);
					return;
				}
			} catch {}
		}

		fetch('https://open.er-api.com/v6/latest/USD')
			.then((r) => r.json())
			.then((data) => {
				if (data?.rates) {
					const fresh: Rates = {
						USD: 1,
						KRW: data.rates.KRW ?? DEFAULT_RATES.KRW,
						UZS: data.rates.UZS ?? DEFAULT_RATES.UZS,
					};
					setRates(fresh);
					localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: fresh }));
				}
			})
			.catch(() => {});
	}, []);

	const setCurrency = useCallback((c: Currency) => {
		setCurrencyState(c);
		localStorage.setItem(STORAGE_KEY, c);
	}, []);

	const formatPrice = useCallback(
		(usdAmount: number | undefined): string => {
			if (!usdAmount && usdAmount !== 0) return '';
			const converted = Math.round(usdAmount * rates[currency]);
			switch (currency) {
				case 'KRW':
					return `₩${converted.toLocaleString('ko-KR')}`;
				case 'UZS':
					if (converted >= 1_000_000_000) return `${(converted / 1_000_000_000).toFixed(1)} mlrd so'm`;
					if (converted >= 1_000_000) return `${(converted / 1_000_000).toFixed(1)} mln so'm`;
					if (converted >= 1_000) return `${(converted / 1_000).toFixed(0)} ming so'm`;
					return `${converted} so'm`;
				default:
					return `$${usdAmount.toLocaleString('en-US')}`;
			}
		},
		[currency, rates],
	);

	return (
		<CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rates }}>
			{children}
		</CurrencyContext.Provider>
	);
}

export const useCurrency = () => useContext(CurrencyContext);
