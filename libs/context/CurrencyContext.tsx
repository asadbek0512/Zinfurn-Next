import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export type Currency = 'USD' | 'KRW' | 'UZS' | 'RUB' | 'AED';

type Rates = Record<Currency, number>;

/** Har bir til uchun standart pul birligi */
export const LOCALE_CURRENCY: Record<string, Currency> = {
	en: 'USD',
	kr: 'KRW',
	uz: 'UZS',
	ru: 'RUB',
	ar: 'AED',
};

export const CURRENCY_LIST: Currency[] = ['USD', 'KRW', 'UZS', 'RUB', 'AED'];

interface CurrencyContextType {
	currency: Currency;
	setCurrency: (c: Currency) => void;
	formatPrice: (usdAmount: number | undefined) => string;
	rates: Rates;
}

const DEFAULT_RATES: Rates = { USD: 1, KRW: 1350, UZS: 12700, RUB: 90, AED: 3.67 };
const STORAGE_KEY = 'zf_currency';
const RATES_CACHE_KEY = 'zf_rates_cache';
const RATES_TTL = 60 * 60 * 1000; // 1 hour

const DEFAULT_CURRENCY: Currency = 'USD';

const CurrencyContext = createContext<CurrencyContextType>({
	currency: DEFAULT_CURRENCY,
	setCurrency: () => {},
	formatPrice: () => '',
	rates: DEFAULT_RATES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const locale = router.locale ?? router.defaultLocale ?? 'en';
	const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
	const [rates, setRates] = useState<Rates>(DEFAULT_RATES);

	// Pul birligi tilga ergashadi; foydalanuvchi qo'lda tanlasa — faqat o'sha til uchun eslab qolinadi
	useEffect(() => {
		const localeCurrency = LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const saved = JSON.parse(raw) as { locale: string; currency: Currency };
				if (saved?.locale === locale && CURRENCY_LIST.includes(saved.currency)) {
					setCurrencyState(saved.currency);
					return;
				}
			}
		} catch {}
		setCurrencyState(localeCurrency);
	}, [locale]);

	useEffect(() => {
		const cached = localStorage.getItem(RATES_CACHE_KEY);
		if (cached) {
			try {
				const { timestamp, data } = JSON.parse(cached);
				// Eski cache'da yangi valyutalar yo'q — bunday holda qayta yuklaymiz
				const isComplete = CURRENCY_LIST.every((c) => typeof data?.[c] === 'number');
				if (isComplete && Date.now() - timestamp < RATES_TTL) {
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
						RUB: data.rates.RUB ?? DEFAULT_RATES.RUB,
						AED: data.rates.AED ?? DEFAULT_RATES.AED,
					};
					setRates(fresh);
					localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: fresh }));
				}
			})
			.catch(() => {});
	}, []);

	const setCurrency = useCallback(
		(c: Currency) => {
			setCurrencyState(c);
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, currency: c }));
		},
		[locale],
	);

	const formatPrice = useCallback(
		(usdAmount: number | undefined): string => {
			if (!usdAmount && usdAmount !== 0) return '';
			const converted = Math.round(usdAmount * rates[currency]);
			switch (currency) {
				case 'KRW':
					return `₩${converted.toLocaleString('ko-KR')}`;
				case 'RUB':
					return `${converted.toLocaleString('ru-RU')} ₽`;
				case 'AED':
					return `${converted.toLocaleString('en-US')} د.إ`;
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
