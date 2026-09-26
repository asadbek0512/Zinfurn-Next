import { compareVar } from '../../apollo/store';

const STORAGE_KEY = 'zinfurn_compare';
export const COMPARE_MAX = 3;

const persist = (ids: string[]) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	}
};

export const loadCompare = () => {
	if (typeof window === 'undefined') return;
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		if (Array.isArray(saved)) compareVar(saved.filter((id) => typeof id === 'string').slice(0, COMPARE_MAX));
	} catch {
		localStorage.removeItem(STORAGE_KEY);
	}
};

/** Qo'shadi yoki olib tashlaydi. Limit to'lgan bo'lsa false qaytaradi */
export const toggleCompare = (propertyId: string): boolean => {
	const current = compareVar();
	if (current.includes(propertyId)) {
		removeFromCompare(propertyId);
		return true;
	}
	if (current.length >= COMPARE_MAX) return false;
	const updated = [...current, propertyId];
	compareVar(updated);
	persist(updated);
	return true;
};

export const removeFromCompare = (propertyId: string) => {
	const updated = compareVar().filter((id) => id !== propertyId);
	compareVar(updated);
	persist(updated);
};

export const clearCompare = () => {
	compareVar([]);
	persist([]);
};
