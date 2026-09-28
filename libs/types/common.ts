import axios from 'axios';
import type { MouseEvent } from 'react';
import type { MutationFunction } from '@apollo/client';
import type { CustomJwtPayload } from './customJwtPayload';

export interface T {
	[key: string]: any;
}



/** getStaticProps / getServerSideProps konteksti — faqat locale kerak bo'lgan joylar uchun */
export interface LocaleContext {
	locale?: string;
}

export const DEFAULT_LOCALE = 'en';

type AxiosErrorBody = { error?: string; errors?: { message?: string }[] };

/** catch'dagi noma'lum xatodan foydalanuvchiga ko'rsatiladigan matn */
export const getErrorMessage = (err: unknown, fallback = ''): string => {
	if (err instanceof Error) return err.message;
	if (typeof err === 'string') return err;
	if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message;
	return fallback;
};

/** axios xatosi — server javobidagi matnni oladi (REST `error` yoki GraphQL `errors[0].message`) */
export const axiosErrorMessage = (err: unknown): string => {
	if (axios.isAxiosError(err)) {
		const data = err.response?.data as AxiosErrorBody | undefined;
		const serverMessage = data?.error ?? data?.errors?.[0]?.message;
		if (serverMessage) return serverMessage;
	}
	return getErrorMessage(err);
};

/** useMutation'dan qaytgan funksiya (like/follow handler'lariga uzatiladi) */
export type MutationFn = MutationFunction<unknown, { input: string }>;

/** Ro'yxatni qayta yuklash — { input } bilan chaqiriladi */
export type RefetchFn = (variables: { input: unknown }) => Promise<unknown>;

/** Member follow/like handler'lari: (id, refetch, query) */
export type MemberActionHandler = (id: string | undefined, refetch: RefetchFn, query: unknown) => Promise<void>;

/** Kartadagi like: (joriy user, target id) */
export type LikeHandler = (user: CustomJwtPayload, id: string) => Promise<void> | void;

export type ElementClickEvent = MouseEvent<HTMLElement>;
