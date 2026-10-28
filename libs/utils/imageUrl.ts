import { REACT_APP_API_URL } from '../config';

/** next.config.js `images.imageSizes`/`deviceSizes` ichidagi qiymatlar bo'lishi shart */
export const CARD_IMAGE_WIDTH = 384;
export const MEDIUM_IMAGE_WIDTH = 640;
export const WIDE_IMAGE_WIDTH = 828;
const IMAGE_QUALITY = 75;

/**
 * Yuklangan rasm (api /uploads) uchun kichraytirilgan webp URL — Next image optimizer orqali.
 * Xom JPEG'lar 50–150KB, kartada esa ~15–25KB yetadi. Natija server keshida saqlanadi.
 */
export const uploadImageUrl = (path: string | undefined, width: number = CARD_IMAGE_WIDTH): string => {
	if (!path) return '';
	const src = `${REACT_APP_API_URL}/${path}`;
	return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${IMAGE_QUALITY}`;
};
