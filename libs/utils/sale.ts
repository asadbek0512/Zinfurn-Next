import { Property } from '../types/property/property';

/**
 * Flash sale oynasi ochiqmi?
 *
 * Mahsulotlarga sale navbatma-navbat beriladi: har biriga boshlanish va tugash
 * sanasi yoziladi, biri tugashi bilan keyingisi ochiladi. Shu sababli
 * `propertyIsOnSale` ning o'zi yetarli emas — sana oynasi ham tekshiriladi.
 * `propertySaleStartsAt` yo'q bo'lsa (eski yozuvlar) sale darrov aktiv sanaladi.
 */
export const isSaleActive = (property?: Partial<Property> | null): boolean => {
	if (!property?.propertyIsOnSale || !property.propertySalePrice) return false;

	const now = Date.now();
	const startsAt = property.propertySaleStartsAt ? new Date(property.propertySaleStartsAt).getTime() : null;
	const expiresAt = property.propertySaleExpiresAt ? new Date(property.propertySaleExpiresAt).getTime() : null;

	if (startsAt !== null && startsAt > now) return false;
	if (expiresAt !== null && expiresAt <= now) return false;
	return true;
};

/**
 * Sale oynasi ochiq bo'lsa chegirma narxini, aks holda undefined qaytaradi.
 * Kartadagi narx, savatga qo'shilgan narx va detal sahifasi shu funksiyaga tayanadi.
 */
export const activeSalePrice = (property?: Partial<Property> | null): number | undefined =>
	isSaleActive(property) ? property?.propertySalePrice : undefined;
