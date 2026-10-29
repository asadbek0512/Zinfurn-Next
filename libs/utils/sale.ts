import { Product } from '../types/product/product';

/**
 * Flash sale oynasi ochiqmi?
 *
 * Mahsulotlarga sale navbatma-navbat beriladi: har biriga boshlanish va tugash
 * sanasi yoziladi, biri tugashi bilan keyingisi ochiladi. Shu sababli
 * `productIsOnSale` ning o'zi yetarli emas — sana oynasi ham tekshiriladi.
 * `productSaleStartsAt` yo'q bo'lsa (eski yozuvlar) sale darrov aktiv sanaladi.
 */
export const isSaleActive = (product?: Partial<Product> | null): boolean => {
	if (!product?.productIsOnSale || !product.productSalePrice) return false;

	const now = Date.now();
	const startsAt = product.productSaleStartsAt ? new Date(product.productSaleStartsAt).getTime() : null;
	const expiresAt = product.productSaleExpiresAt ? new Date(product.productSaleExpiresAt).getTime() : null;

	if (startsAt !== null && startsAt > now) return false;
	if (expiresAt !== null && expiresAt <= now) return false;
	return true;
};

/**
 * Sale oynasi ochiq bo'lsa chegirma narxini, aks holda undefined qaytaradi.
 * Kartadagi narx, savatga qo'shilgan narx va detal sahifasi shu funksiyaga tayanadi.
 */
export const activeSalePrice = (product?: Partial<Product> | null): number | undefined =>
	isSaleActive(product) ? product?.productSalePrice : undefined;
