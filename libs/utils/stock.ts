/** Kam qolgan deb hisoblanadigan chegara. */
export const LOW_STOCK_THRESHOLD = 5;

export interface StockInfo {
	soldOut: boolean;
	low: boolean;
	count: number;
}

/**
 * Zaxira holatini qaytaradi. null/undefined = cheksiz (badge ko'rsatilmaydi).
 * 0 yoki past = tugagan, chegaradan past = "oz qoldi".
 */
export const getStockInfo = (stock?: number | null): StockInfo | null => {
	if (stock === null || stock === undefined) return null;
	if (stock <= 0) return { soldOut: true, low: false, count: 0 };
	if (stock <= LOW_STOCK_THRESHOLD) return { soldOut: false, low: true, count: stock };
	return null; // yetarli — badge shart emas
};

/** Sotib olish mumkinmi (tugamagan). stock=null bo'lsa doim true. */
export const isPurchasable = (stock?: number | null): boolean => {
	return !(typeof stock === 'number' && stock <= 0);
};
