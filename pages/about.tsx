import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography, Divider, Link as MuiLink } from '@mui/material';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import SEO from '../libs/components/common/SEO';

const SITE_URL = 'https://zinfurn.uz';
const AUTHOR = 'Asadbek Khusanov';
const AUTHOR_URL = 'https://khusanovdev.uz';
const AUTHOR_GITHUB = 'https://github.com/asadbek0512';

/**
 * "Zinfurn nima?" degan savolga aniq javob beradigan sahifa.
 *
 * Maqsad — SEO emas, AI retrieval: ChatGPT/Perplexity/AI Overviews savolga
 * o'xshash matnni qidiradi, shuning uchun savol-javob shaklida yozilgan.
 *
 * Matn locale JSON'da emas, shu yerda: bu qisqa UI label emas, sahifaga xos
 * uzun proza — bir joyda turgani tarjimalarni solishtirishni osonlashtiradi.
 */
type AboutContent = {
	title: string;
	intro: string;
	faq: { q: string; a: string }[];
	techTitle: string;
	authorTitle: string;
	authorText: string;
};

const CONTENT: Record<string, AboutContent> = {
	en: {
		title: 'About Zinfurn',
		intro:
			'Zinfurn is an online furniture store and marketplace serving the Uzbek community in South Korea and customers in Uzbekistan. It offers sofas, tables, chairs, bedroom and kitchen furniture, along with a furniture repair service.',
		faq: [
			{
				q: 'What is Zinfurn?',
				a: 'Zinfurn is an online furniture marketplace where customers can browse, filter and order furniture — sofas, tables, chairs, bedroom and kitchen sets. It also connects customers with furniture repair specialists.',
			},
			{
				q: 'Who is Zinfurn for?',
				a: 'Zinfurn primarily serves Uzbeks living in South Korea and customers in Uzbekistan. The interface is available in five languages: Uzbek, English, Russian, Korean and Arabic.',
			},
			{
				q: 'Where does Zinfurn deliver?',
				a: 'Delivery is arranged per order, and shipping cost depends on the destination and the size of the item. Delivery details are confirmed with the seller during checkout.',
			},
			{
				q: 'When was Zinfurn launched?',
				a: 'Zinfurn has been running since 2024. The platform is actively developed and new features are released regularly.',
			},
		],
		techTitle: 'How Zinfurn is built',
		authorTitle: 'Who built Zinfurn',
		authorText: `Zinfurn was designed and developed by ${AUTHOR}, a full-stack developer. The entire platform — frontend, backend, admin panel and infrastructure — was built and is maintained by him.`,
	},
	uz: {
		title: 'Zinfurn haqida',
		intro:
			'Zinfurn — Janubiy Koreyadagi oʻzbek jamoasi va Oʻzbekistondagi mijozlar uchun onlayn mebel doʻkoni va bozori. Divan, stol, stul, yotoqxona va oshxona mebellari hamda mebel taʼmirlash xizmati mavjud.',
		faq: [
			{
				q: 'Zinfurn nima?',
				a: 'Zinfurn — onlayn mebel bozori. Mijozlar divan, stol, stul, yotoqxona va oshxona mebellarini koʻrib chiqishi, filtrlashi va buyurtma qilishi mumkin. Shuningdek, mebel taʼmirlash ustalari bilan bogʻlanish imkoni bor.',
			},
			{
				q: 'Zinfurn kimlar uchun?',
				a: 'Zinfurn asosan Janubiy Koreyada yashovchi oʻzbeklar va Oʻzbekistondagi mijozlarga xizmat qiladi. Interfeys besh tilda: oʻzbek, ingliz, rus, koreys va arab.',
			},
			{
				q: 'Zinfurn qayerga yetkazib beradi?',
				a: 'Yetkazib berish har buyurtma boʻyicha alohida kelishiladi, narx manzil va mahsulot oʻlchamiga qarab oʻzgaradi. Tafsilotlar buyurtma rasmiylashtirishda sotuvchi bilan tasdiqlanadi.',
			},
			{
				q: 'Zinfurn qachon ishga tushgan?',
				a: 'Zinfurn 2024-yildan beri ishlaydi. Platforma faol rivojlantirilmoqda, yangi imkoniyatlar muntazam qoʻshib borilyapti.',
			},
		],
		techTitle: 'Zinfurn qanday qurilgan',
		authorTitle: 'Zinfurn muallifi',
		authorText: `Zinfurn full-stack dasturchi ${AUTHOR} tomonidan loyihalangan va ishlab chiqilgan. Platformaning barcha qismi — frontend, backend, admin panel va infratuzilma — uning tomonidan qurilgan va yuritiladi.`,
	},
	ru: {
		title: 'О Zinfurn',
		intro:
			'Zinfurn — интернет-магазин и маркетплейс мебели для узбекской общины в Южной Корее и покупателей в Узбекистане. Диваны, столы, стулья, мебель для спальни и кухни, а также услуга ремонта мебели.',
		faq: [
			{
				q: 'Что такое Zinfurn?',
				a: 'Zinfurn — онлайн-маркетплейс мебели, где можно просматривать, фильтровать и заказывать мебель: диваны, столы, стулья, мебель для спальни и кухни. Также доступна связь со специалистами по ремонту мебели.',
			},
			{
				q: 'Для кого Zinfurn?',
				a: 'Zinfurn ориентирован на узбеков, живущих в Южной Корее, и покупателей в Узбекистане. Интерфейс доступен на пяти языках: узбекском, английском, русском, корейском и арабском.',
			},
			{
				q: 'Куда доставляет Zinfurn?',
				a: 'Доставка согласовывается по каждому заказу, стоимость зависит от адреса и габаритов товара. Детали подтверждаются с продавцом при оформлении заказа.',
			},
			{
				q: 'Когда запущен Zinfurn?',
				a: 'Zinfurn работает с 2024 года. Платформа активно развивается, новые возможности добавляются регулярно.',
			},
		],
		techTitle: 'Как устроен Zinfurn',
		authorTitle: 'Автор Zinfurn',
		authorText: `Zinfurn спроектирован и разработан full-stack разработчиком ${AUTHOR}. Вся платформа — фронтенд, бэкенд, админ-панель и инфраструктура — построена и поддерживается им.`,
	},
	kr: {
		title: 'Zinfurn 소개',
		intro:
			'Zinfurn은 한국에 거주하는 우즈베크 커뮤니티와 우즈베키스탄 고객을 위한 온라인 가구 쇼핑몰이자 마켓플레이스입니다. 소파, 테이블, 의자, 침실 및 주방 가구와 가구 수리 서비스를 제공합니다.',
		faq: [
			{
				q: 'Zinfurn이란 무엇인가요?',
				a: 'Zinfurn은 소파, 테이블, 의자, 침실 및 주방 가구를 검색하고 필터링하여 주문할 수 있는 온라인 가구 마켓플레이스입니다. 가구 수리 전문가와 연결하는 기능도 제공합니다.',
			},
			{
				q: 'Zinfurn은 누구를 위한 서비스인가요?',
				a: 'Zinfurn은 주로 한국에 거주하는 우즈베크인과 우즈베키스탄 고객을 대상으로 합니다. 인터페이스는 우즈베크어, 영어, 러시아어, 한국어, 아랍어 5개 언어를 지원합니다.',
			},
			{
				q: 'Zinfurn은 어디로 배송하나요?',
				a: '배송은 주문별로 조율되며, 배송비는 목적지와 상품 크기에 따라 달라집니다. 자세한 내용은 주문 시 판매자와 확인합니다.',
			},
			{
				q: 'Zinfurn은 언제 시작되었나요?',
				a: 'Zinfurn은 2024년부터 운영되고 있습니다. 플랫폼은 활발히 개발 중이며 새로운 기능이 정기적으로 추가됩니다.',
			},
		],
		techTitle: 'Zinfurn 기술 스택',
		authorTitle: 'Zinfurn 개발자',
		authorText: `Zinfurn은 풀스택 개발자 ${AUTHOR}가 설계하고 개발했습니다. 프론트엔드, 백엔드, 관리자 패널, 인프라까지 플랫폼 전체를 직접 구축하고 운영하고 있습니다.`,
	},
	ar: {
		title: 'عن Zinfurn',
		intro:
			'‏Zinfurn هو متجر أثاث عبر الإنترنت وسوق إلكتروني يخدم الجالية الأوزبكية في كوريا الجنوبية والعملاء في أوزبكستان. يوفر الأرائك والطاولات والكراسي وأثاث غرف النوم والمطبخ، إضافة إلى خدمة إصلاح الأثاث.',
		faq: [
			{
				q: 'ما هو Zinfurn؟',
				a: '‏Zinfurn هو سوق أثاث إلكتروني يمكن للعملاء من خلاله تصفح الأثاث وتصفيته وطلبه: الأرائك والطاولات والكراسي وأطقم غرف النوم والمطبخ. كما يوفر التواصل مع مختصي إصلاح الأثاث.',
			},
			{
				q: 'لمن Zinfurn؟',
				a: 'يخدم Zinfurn بشكل أساسي الأوزبك المقيمين في كوريا الجنوبية والعملاء في أوزبكستان. الواجهة متوفرة بخمس لغات: الأوزبكية والإنجليزية والروسية والكورية والعربية.',
			},
			{
				q: 'إلى أين يوصل Zinfurn؟',
				a: 'يتم ترتيب التوصيل لكل طلب على حدة، وتعتمد التكلفة على الوجهة وحجم المنتج. تُؤكد التفاصيل مع البائع عند إتمام الطلب.',
			},
			{
				q: 'متى أُطلق Zinfurn؟',
				a: 'يعمل Zinfurn منذ عام 2024. تُطوَّر المنصة بنشاط وتُضاف ميزات جديدة بانتظام.',
			},
		],
		techTitle: 'كيف بُني Zinfurn',
		authorTitle: 'من بنى Zinfurn',
		authorText: `صُمم Zinfurn وطُوّر على يد المطور ${AUTHOR}. المنصة بالكامل — الواجهة الأمامية والخلفية ولوحة الإدارة والبنية التحتية — بُنيت ويتم صيانتها من قِبله.`,
	},
};

const TECH_STACK = [
	'Next.js 14 (TypeScript, Pages Router)',
	'NestJS 10 + MongoDB',
	'GraphQL (Apollo) + WebSocket subscriptions',
	'JWT auth, Google & Telegram OAuth',
	'i18n — 5 languages (uz, en, ru, ko, ar)',
	'Docker + Nginx on a Linux VPS',
];

// Tashqi o'ram MUI Box emas, oddiy div: Box'ning polymorphic tiplari bu sahifada
// TS2590 ("union type too complex") beradi. Ichkarida MUI komponentlari ishlayveradi.
const PAGE_STYLE: React.CSSProperties = {
	maxWidth: 860,
	margin: '0 auto',
	padding: '48px 24px',
	display: 'flex',
	flexDirection: 'column',
};

const About: NextPage = () => {
	const { locale = 'en' } = useRouter();
	const c = CONTENT[locale] || CONTENT.en;
	const isRtl = locale === 'ar';

	// FAQPage — Google rich result va AI retrieval uchun savol/javob juftliklari
	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'@id': `${SITE_URL}/about#faq`,
		mainEntity: c.faq.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: { '@type': 'Answer', text: item.a },
		})),
		about: { '@id': `${SITE_URL}/#organization` },
	};

	return (
		<div style={{ ...PAGE_STYLE, direction: isRtl ? 'rtl' : 'ltr' }}>
			<SEO title={c.title} description={c.intro} url={`${SITE_URL}${locale === 'en' ? '' : `/${locale}`}/about`} jsonLd={faqJsonLd} />

			<Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
				{c.title}
			</Typography>
			<Typography sx={{ fontSize: 18, lineHeight: 1.7, mb: 5, opacity: 0.9 }}>{c.intro}</Typography>

			{c.faq.map((item) => (
				<div key={item.q} style={{ marginBottom: 32 }}>
					<Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
						{item.q}
					</Typography>
					<Typography sx={{ lineHeight: 1.7, opacity: 0.85 }}>{item.a}</Typography>
				</div>
			))}

			<Divider sx={{ my: 4 }} />

			<Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
				{c.techTitle}
			</Typography>
			<ul style={{ paddingInlineStart: 24, marginBottom: 40, lineHeight: 1.9, opacity: 0.85 }}>
				{TECH_STACK.map((tech) => (
					<li key={tech}>{tech}</li>
				))}
			</ul>

			<Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
				{c.authorTitle}
			</Typography>
			<Typography sx={{ lineHeight: 1.7, opacity: 0.85, mb: 2 }}>{c.authorText}</Typography>
			<Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
				<MuiLink href={AUTHOR_URL} target="_blank" rel="noopener author">
					khusanovdev.uz
				</MuiLink>
				<MuiLink href={AUTHOR_GITHUB} target="_blank" rel="noopener author">
					GitHub
				</MuiLink>
			</Stack>
		</div>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withLayoutBasic(About);
