/**
 * Ism-familiyani ko'rsatish uchun formatlaydi: har so'zning birinchi harfi katta.
 * Ba'zi foydalanuvchilar ismini kichik harf bilan kiritadi ("shaxrik"), lekin
 * ro'yxatlarda u "Shaxrik" bo'lib ko'rinishi kerak.
 */
export const formatDisplayName = (name?: string | null): string => {
	if (!name) return '';
	return name
		.trim()
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};
