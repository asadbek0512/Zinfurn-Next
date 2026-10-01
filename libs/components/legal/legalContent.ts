/**
 * Privacy Policy va Terms matni — App Store / Google Play talab qiladigan ochiq URL'lar
 * (/privacy, /terms). Uzun huquqiy proza bo'lgani uchun locale JSON'da emas, shu yerda.
 * Tarjimasi yo'q tillar inglizchani ko'radi.
 *
 * Diqqat: sayt yangi tashqi xizmatga ma'lumot yubora boshlasa (analytics, to'lov, AI) —
 * bu yerdagi "Third-party services" bo'limini ham yangilash shart.
 */
export const LEGAL_CONTACT_EMAIL = 'khusanovasadbek777@gmail.com';
export const LEGAL_OPERATOR = 'Asadbek Khusanov';
export const LEGAL_UPDATED = '2026-10-01';
export const ACCOUNT_DELETION_SECTION_ID = 'delete-account';

export type LegalSection = { id?: string; title: string; paragraphs: string[]; items?: string[] };
export type LegalDoc = { title: string; updatedLabel: string; intro: string; sections: LegalSection[] };

const PRIVACY_EN: LegalDoc = {
	title: 'Privacy Policy',
	updatedLabel: 'Last updated',
	intro: `This Privacy Policy explains what personal data Zinfurn (the website zinfurn.uz and the Zinfurn mobile apps for Android and iOS, together the "Service") collects, why, and what choices you have. The Service is operated by ${LEGAL_OPERATOR} ("we", "us").`,
	sections: [
		{
			title: '1. Data we collect',
			paragraphs: ['We only collect what is needed to run the store, deliver orders and keep your account secure:'],
			items: [
				'Account data: username, password (stored only as a one-way hash), and — if you choose to provide them — phone number, email, full name, address and profile photo.',
				'Sign-in data: if you sign in with Google or Telegram, we receive your Google or Telegram account ID and basic public profile (name, photo). We never receive your Google or Telegram password.',
				'Order data: ordered items, delivery address, phone number, order status and payment status.',
				'Content you create: listings, articles, comments, reviews, likes, follows and chat messages.',
				'Technical data: device and browser type, app version, pages viewed, and error reports needed to fix crashes.',
			],
		},
		{
			title: '2. How we use your data',
			paragraphs: [],
			items: [
				'to create and secure your account and keep you signed in;',
				'to process, deliver and support your orders and repair requests;',
				'to show your public profile, listings and community posts to other users;',
				'to answer your questions in customer support and the AI assistant;',
				'to understand how the Service is used and to fix errors.',
			],
		},
		{
			title: '3. Third-party services',
			paragraphs: ['We share data only with the services needed to operate the Service:'],
			items: [
				'Toss Payments — processes card payments. Card details are entered on Toss pages and are never stored by us.',
				'Google and Telegram — only when you choose to sign in with them.',
				'Groq (AI chat) — messages you type into the AI assistant are sent for processing to generate an answer.',
				'Google Analytics and Yandex Metrica — anonymous usage statistics on the website.',
				'Sentry — error reports that help us fix crashes.',
				'Oracle Cloud — hosting of our servers and database.',
			],
		},
		{
			title: '4. What we do not do',
			paragraphs: [
				'We do not sell your personal data. We do not use your data for third-party advertising and we do not track you across other companies\' apps or websites.',
			],
		},
		{
			title: '5. Storage and security',
			paragraphs: [
				'Data is transmitted over encrypted connections (HTTPS). Passwords are stored as hashes. Sign-in sessions use short-lived tokens and can be ended by logging out. Access to the database is restricted to the operator.',
			],
		},
		{
			title: '6. Data retention',
			paragraphs: [
				'We keep your account data while your account exists. When you delete your account, your personal data is removed immediately (see below). Order records may be kept in anonymised form for as long as required for accounting and legal obligations.',
			],
		},
		{
			id: ACCOUNT_DELETION_SECTION_ID,
			title: '7. Deleting your account',
			paragraphs: [
				'You can delete your account at any time, directly in the app or on the website:',
				`If you cannot sign in, email ${LEGAL_CONTACT_EMAIL} from the email linked to your account (or tell us your username) and we will delete the account within 30 days.`,
			],
			items: [
				'Sign in → open Profile (My Page) → My Profile.',
				'Tap "Delete account" at the bottom of the page and confirm.',
				'Your username, phone, email, name, address, photo, password, Google/Telegram links and active sessions are deleted, and your listings are removed. This cannot be undone.',
			],
		},
		{
			title: '8. Your rights',
			paragraphs: [
				`You can view and edit your profile data at any time in My Profile. You may also ask us for a copy of your data or for its correction or deletion by emailing ${LEGAL_CONTACT_EMAIL}.`,
			],
		},
		{
			title: '9. Children',
			paragraphs: ['The Service is not directed at children under 14, and we do not knowingly collect their personal data.'],
		},
		{
			title: '10. Changes and contact',
			paragraphs: [
				'If we change this policy, we will update the date at the top of this page. For any privacy question, contact us:',
				`${LEGAL_OPERATOR} · ${LEGAL_CONTACT_EMAIL}`,
			],
		},
	],
};

const PRIVACY_UZ: LegalDoc = {
	title: 'Maxfiylik siyosati',
	updatedLabel: 'Oxirgi yangilanish',
	intro: `Ushbu Maxfiylik siyosati Zinfurn (zinfurn.uz sayti hamda Android va iOS uchun Zinfurn ilovalari, birgalikda "Xizmat") qanday shaxsiy ma'lumotlarni, nima uchun to'plashini va sizda qanday tanlov borligini tushuntiradi. Xizmat operatori — ${LEGAL_OPERATOR} ("biz").`,
	sections: [
		{
			title: "1. Qanday ma'lumot to'playmiz",
			paragraphs: ["Faqat do'kon ishlashi, buyurtmani yetkazish va akkaunt xavfsizligi uchun kerak bo'lganini:"],
			items: [
				"Akkaunt ma'lumotlari: foydalanuvchi nomi, parol (faqat bir tomonlama hash ko'rinishida) va — o'zingiz kiritsangiz — telefon, email, to'liq ism, manzil, profil rasmi.",
				"Kirish ma'lumotlari: Google yoki Telegram orqali kirsangiz, akkaunt ID'si va ochiq profil (ism, rasm) olinadi. Google/Telegram parolingiz bizga hech qachon kelmaydi.",
				"Buyurtma ma'lumotlari: mahsulotlar, yetkazish manzili, telefon, buyurtma va to'lov holati.",
				"Siz yaratgan kontent: e'lonlar, maqolalar, izohlar, sharhlar, layklar, obunalar va chat xabarlari.",
				"Texnik ma'lumotlar: qurilma va brauzer turi, ilova versiyasi, ko'rilgan sahifalar va xatolarni tuzatish uchun xato hisobotlari.",
			],
		},
		{
			title: "2. Ma'lumotdan qanday foydalanamiz",
			paragraphs: [],
			items: [
				'akkauntni yaratish, himoyalash va tizimda saqlab turish;',
				"buyurtma va ta'mirlash so'rovlarini bajarish, yetkazish va qo'llab-quvvatlash;",
				"ochiq profil, e'lon va hamjamiyat postlaringizni boshqa foydalanuvchilarga ko'rsatish;",
				'mijozlarni qo\'llab-quvvatlash va AI yordamchida savollarga javob berish;',
				'Xizmatdan qanday foydalanilishini tushunish va xatolarni tuzatish.',
			],
		},
		{
			title: '3. Uchinchi tomon xizmatlari',
			paragraphs: ["Ma'lumot faqat Xizmat ishlashi uchun zarur xizmatlarga beriladi:"],
			items: [
				"Toss Payments — karta to'lovlari. Karta ma'lumotlari Toss sahifasida kiritiladi, bizda saqlanmaydi.",
				'Google va Telegram — faqat ular orqali kirishni tanlasangiz.',
				'Groq (AI chat) — AI yordamchiga yozgan xabarlaringiz javob tayyorlash uchun yuboriladi.',
				'Google Analytics va Yandex Metrica — saytdan foydalanish bo\'yicha anonim statistika.',
				'Sentry — xatolarni tuzatish uchun xato hisobotlari.',
				"Oracle Cloud — server va ma'lumotlar bazasi joylashgan hosting.",
			],
		},
		{
			title: '4. Nima qilmaymiz',
			paragraphs: [
				"Shaxsiy ma'lumotlaringizni sotmaymiz. Ularni uchinchi tomon reklamasi uchun ishlatmaymiz va sizni boshqa kompaniyalar ilova/saytlarida kuzatmaymiz.",
			],
		},
		{
			title: '5. Saqlash va xavfsizlik',
			paragraphs: [
				"Ma'lumotlar shifrlangan ulanish (HTTPS) orqali uzatiladi. Parollar hash ko'rinishida saqlanadi. Kirish sessiyalari qisqa muddatli token'lardan foydalanadi va chiqish orqali yopiladi. Bazaga kirish faqat operatorda.",
			],
		},
		{
			title: "6. Saqlash muddati",
			paragraphs: [
				"Akkaunt ma'lumotlari akkaunt mavjud ekan saqlanadi. Akkauntni o'chirsangiz, shaxsiy ma'lumotlar darhol o'chiriladi (pastga qarang). Buyurtma yozuvlari hisob-kitob va qonuniy majburiyatlar uchun anonim ko'rinishda saqlanishi mumkin.",
			],
		},
		{
			id: ACCOUNT_DELETION_SECTION_ID,
			title: "7. Akkauntni o'chirish",
			paragraphs: [
				"Akkauntni istalgan vaqtda ilova yoki saytning o'zida o'chirishingiz mumkin:",
				`Tizimga kira olmasangiz, akkauntga bog'langan emaildan ${LEGAL_CONTACT_EMAIL} ga yozing (yoki foydalanuvchi nomingizni ayting) — akkaunt 30 kun ichida o'chiriladi.`,
			],
			items: [
				'Tizimga kiring → Profil (Shaxsiy kabinet) → Profilim.',
				"Sahifa pastidagi \"Akkauntni o'chirish\" tugmasini bosing va tasdiqlang.",
				"Foydalanuvchi nomi, telefon, email, ism, manzil, rasm, parol, Google/Telegram bog'lanishlari va faol sessiyalar o'chiriladi, e'lonlaringiz olib tashlanadi. Buni qaytarib bo'lmaydi.",
			],
		},
		{
			title: '8. Huquqlaringiz',
			paragraphs: [
				`Profil ma'lumotlarini istalgan vaqtda "Profilim"da ko'rishingiz va tahrirlashingiz mumkin. Ma'lumotlaringiz nusxasini, tuzatilishini yoki o'chirilishini ${LEGAL_CONTACT_EMAIL} orqali so'rashingiz mumkin.`,
			],
		},
		{
			title: '9. Bolalar',
			paragraphs: ["Xizmat 14 yoshgacha bolalar uchun mo'ljallanmagan va biz ularning ma'lumotlarini ataylab to'plamaymiz."],
		},
		{
			title: "10. O'zgarishlar va aloqa",
			paragraphs: [
				"Siyosat o'zgarsa, sahifa tepasidagi sana yangilanadi. Maxfiylik bo'yicha savollar uchun:",
				`${LEGAL_OPERATOR} · ${LEGAL_CONTACT_EMAIL}`,
			],
		},
	],
};

const TERMS_EN: LegalDoc = {
	title: 'Terms of Use',
	updatedLabel: 'Last updated',
	intro: `These Terms govern your use of Zinfurn — the website zinfurn.uz and the Zinfurn mobile apps (the "Service"), operated by ${LEGAL_OPERATOR}. By using the Service you agree to these Terms.`,
	sections: [
		{
			title: '1. Accounts',
			paragraphs: [
				'You are responsible for the information in your account and for keeping your sign-in details safe. You can delete your account at any time in My Profile → "Delete account".',
			],
		},
		{
			title: '2. Orders and payments',
			paragraphs: [
				'Prices, discounts and availability are shown on product pages and may change. An order is confirmed after successful payment. Card payments are processed by Toss Payments. Delivery times are estimates.',
			],
		},
		{
			title: '3. Returns and repairs',
			paragraphs: [
				'Return, exchange and repair conditions are agreed with the seller or repair specialist for each order. Contact customer support if something is wrong with your order.',
			],
		},
		{
			title: '4. User content',
			paragraphs: [
				'You keep the rights to listings, articles, comments, reviews and messages you post, and you allow us to display them in the Service. Content must be lawful, accurate and respectful.',
			],
			items: [
				'no spam, fraud, fake listings or misleading prices;',
				'no harassment, hate speech, or sexual or violent content;',
				'no content that infringes others\' rights.',
			],
		},
		{
			title: '5. Reporting and moderation',
			paragraphs: [
				`Use the ⋮ menu on any post, comment or profile to report content or block a user. Blocked users' posts, comments and messages are hidden from you. You can also email ${LEGAL_CONTACT_EMAIL}. We review reports within 24 hours and remove objectionable content and ban accounts that break these Terms.`,
			],
		},
		{
			title: '6. AI assistant',
			paragraphs: [
				'The AI assistant gives automated suggestions that may be inaccurate. Always check prices, sizes and availability on the product page before ordering.',
			],
		},
		{
			title: '7. Liability',
			paragraphs: [
				'The Service is provided "as is". To the extent permitted by law, we are not liable for indirect losses or for temporary unavailability of the Service.',
			],
		},
		{
			title: '8. Changes and contact',
			paragraphs: [
				'We may update these Terms; the date at the top shows the latest version. Questions:',
				`${LEGAL_OPERATOR} · ${LEGAL_CONTACT_EMAIL}`,
			],
		},
	],
};

const TERMS_UZ: LegalDoc = {
	title: 'Foydalanish shartlari',
	updatedLabel: 'Oxirgi yangilanish',
	intro: `Ushbu Shartlar Zinfurn — zinfurn.uz sayti va Zinfurn mobil ilovalaridan ("Xizmat") foydalanishni tartibga soladi. Operator — ${LEGAL_OPERATOR}. Xizmatdan foydalanib, siz ushbu Shartlarga rozilik bildirasiz.`,
	sections: [
		{
			title: '1. Akkauntlar',
			paragraphs: [
				"Akkauntingizdagi ma'lumotlar va kirish ma'lumotlarini xavfsiz saqlash sizning mas'uliyatingizda. Akkauntni istalgan vaqtda Profilim → \"Akkauntni o'chirish\" orqali o'chirishingiz mumkin.",
			],
		},
		{
			title: "2. Buyurtma va to'lov",
			paragraphs: [
				"Narx, chegirma va mavjudlik mahsulot sahifasida ko'rsatiladi va o'zgarishi mumkin. Buyurtma muvaffaqiyatli to'lovdan keyin tasdiqlanadi. Karta to'lovlarini Toss Payments amalga oshiradi. Yetkazish muddatlari taxminiy.",
			],
		},
		{
			title: "3. Qaytarish va ta'mirlash",
			paragraphs: [
				"Qaytarish, almashtirish va ta'mirlash shartlari har bir buyurtma uchun sotuvchi yoki usta bilan kelishiladi. Buyurtmada muammo bo'lsa, qo'llab-quvvatlash xizmatiga murojaat qiling.",
			],
		},
		{
			title: '4. Foydalanuvchi kontenti',
			paragraphs: [
				"Siz joylagan e'lon, maqola, izoh, sharh va xabarlarga huquq sizda qoladi, biz ularni Xizmatda ko'rsatishimiz mumkin. Kontent qonuniy, to'g'ri va hurmatli bo'lishi shart.",
			],
			items: [
				"spam, firibgarlik, soxta e'lon yoki chalg'ituvchi narx yo'q;",
				"haqorat, nafrat, jinsiy yoki zo'ravon kontent yo'q;",
				"boshqalar huquqini buzadigan kontent yo'q.",
			],
		},
		{
			title: '5. Shikoyat va moderatsiya',
			paragraphs: [
				`Har qanday post, izoh yoki profildagi ⋮ menyu orqali shikoyat qilishingiz yoki foydalanuvchini bloklashingiz mumkin. Bloklangan foydalanuvchining postlari, izohlari va xabarlari sizga ko'rinmaydi. ${LEGAL_CONTACT_EMAIL} ga yozishingiz ham mumkin. Shikoyatlar 24 soat ichida ko'rib chiqiladi; qoidabuzar kontent o'chiriladi va akkaunt bloklanadi.`,
			],
		},
		{
			title: '6. AI yordamchi',
			paragraphs: [
				"AI yordamchi avtomatik tavsiyalar beradi va ular xato bo'lishi mumkin. Buyurtmadan oldin narx, o'lcham va mavjudlikni mahsulot sahifasida tekshiring.",
			],
		},
		{
			title: "7. Javobgarlik",
			paragraphs: [
				"Xizmat \"boricha\" taqdim etiladi. Qonun ruxsat bergan darajada biz bilvosita zararlar yoki Xizmatning vaqtincha ishlamay qolishi uchun javobgar emasmiz.",
			],
		},
		{
			title: "8. O'zgarishlar va aloqa",
			paragraphs: [
				"Shartlar yangilanishi mumkin; tepadagi sana oxirgi versiyani ko'rsatadi. Savollar uchun:",
				`${LEGAL_OPERATOR} · ${LEGAL_CONTACT_EMAIL}`,
			],
		},
	],
};

export const PRIVACY_CONTENT: Record<string, LegalDoc> = { en: PRIVACY_EN, uz: PRIVACY_UZ };
export const TERMS_CONTENT: Record<string, LegalDoc> = { en: TERMS_EN, uz: TERMS_UZ };
