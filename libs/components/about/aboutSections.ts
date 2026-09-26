/**
 * About sahifasining vizual bo'limlari uchun matnlar (qadriyatlar, qadamlar, CTA).
 * FAQ va intro `pages/about.tsx` dagi CONTENT'da qoladi — ular AI retrieval uchun.
 */
export type AboutItem = { title: string; text: string };

export type AboutSections = {
	eyebrow: string;
	browse: string;
	contact: string;
	statsProducts: string;
	statsAgents: string;
	statsSince: string;
	statsLanguages: string;
	valuesTitle: string;
	values: AboutItem[];
	stepsTitle: string;
	steps: AboutItem[];
	storyEyebrow: string;
	storyTitle: string;
	storyText: string;
	faqTitle: string;
	ctaTitle: string;
	ctaText: string;
};

export const ABOUT_SECTIONS: Record<string, AboutSections> = {
	en: {
		eyebrow: 'Our story',
		browse: 'Browse furniture',
		contact: 'Contact us',
		statsProducts: 'Products',
		statsAgents: 'Trusted agents',
		statsSince: 'Serving since',
		statsLanguages: 'Languages',
		valuesTitle: 'Why customers choose Zinfurn',
		values: [
			{ title: 'Curated quality', text: 'Every item is checked for condition, materials and finish before it is listed.' },
			{ title: 'Delivery to your door', text: 'Delivery is arranged for each order, with cost and timing confirmed upfront.' },
			{ title: 'Your language', text: 'Shop and get support in Uzbek, English, Russian, Korean or Arabic.' },
			{ title: 'Repair service', text: 'Beyond sales, we restore and repair furniture so it lasts for years.' },
		],
		stepsTitle: 'How it works',
		steps: [
			{ title: 'Choose', text: 'Browse and filter by category, material, color and price.' },
			{ title: 'Add to cart', text: 'Compare items side by side and save favorites.' },
			{ title: 'Place order', text: 'Checkout in minutes and track your order online.' },
			{ title: 'Receive', text: 'We deliver the furniture and confirm everything with you.' },
		],
		storyEyebrow: 'Who we are',
		storyTitle: 'Furniture that feels like home, wherever you are',
		storyText:
			'Zinfurn started with a simple idea: people living far from home deserve an easy, honest way to furnish their space. Today it brings together sellers, agents and customers on one platform — with clear prices, real photos and support in your own language.',
		faqTitle: 'Frequently asked questions',
		ctaTitle: 'Ready to find your next piece?',
		ctaText: 'Explore our catalog and create a space you love.',
	},
	uz: {
		eyebrow: 'Bizning hikoyamiz',
		browse: 'Mebellarni ko‘rish',
		contact: 'Bog‘lanish',
		statsProducts: 'Mahsulotlar',
		statsAgents: 'Ishonchli agentlar',
		statsSince: 'Faoliyat boshlangan',
		statsLanguages: 'Tillar',
		valuesTitle: 'Nega mijozlar Zinfurn’ni tanlaydi',
		values: [
			{ title: 'Tanlangan sifat', text: 'Har bir mahsulot joylashdan oldin holati, materiali va pardozi tekshiriladi.' },
			{ title: 'Eshigingizgacha yetkazish', text: 'Har bir buyurtma uchun yetkazish tashkil etiladi, narx va muddat oldindan kelishiladi.' },
			{ title: 'O‘z tilingizda', text: 'O‘zbek, ingliz, rus, koreys yoki arab tilida xarid qiling va yordam oling.' },
			{ title: 'Ta’mir xizmati', text: 'Sotuvdan tashqari, mebelni ta’mirlab, yillar davomida xizmat qilishini ta’minlaymiz.' },
		],
		stepsTitle: 'Qanday ishlaydi',
		steps: [
			{ title: 'Tanlang', text: 'Kategoriya, material, rang va narx bo‘yicha qidiring.' },
			{ title: 'Savatga qo‘shing', text: 'Mahsulotlarni solishtiring va sevimlilarga saqlang.' },
			{ title: 'Buyurtma bering', text: 'Bir necha daqiqada rasmiylashtiring va onlayn kuzating.' },
			{ title: 'Qabul qiling', text: 'Mebelni yetkazib beramiz va hammasini siz bilan tasdiqlaymiz.' },
		],
		storyEyebrow: 'Biz kimmiz',
		storyTitle: 'Qayerda bo‘lmang, uydagidek qulay mebel',
		storyText:
			'Zinfurn oddiy g‘oyadan boshlandi: uydan uzoqda yashayotgan insonlar ham o‘z makonini oson va halol jihozlashi kerak. Bugun u sotuvchilar, agentlar va mijozlarni bitta platformada birlashtiradi — aniq narxlar, haqiqiy rasmlar va o‘z tilingizdagi yordam bilan.',
		faqTitle: 'Ko‘p beriladigan savollar',
		ctaTitle: 'Keyingi mebelingizni topishga tayyormisiz?',
		ctaText: 'Katalogimizni ko‘rib chiqing va o‘zingiz yoqtirgan makonni yarating.',
	},
	ru: {
		eyebrow: 'Наша история',
		browse: 'Смотреть мебель',
		contact: 'Связаться',
		statsProducts: 'Товаров',
		statsAgents: 'Надёжных агентов',
		statsSince: 'Работаем с',
		statsLanguages: 'Языков',
		valuesTitle: 'Почему выбирают Zinfurn',
		values: [
			{ title: 'Проверенное качество', text: 'Каждый товар проверяется на состояние, материалы и отделку перед публикацией.' },
			{ title: 'Доставка до двери', text: 'Доставка организуется для каждого заказа, стоимость и сроки согласуются заранее.' },
			{ title: 'На вашем языке', text: 'Покупайте и получайте поддержку на узбекском, английском, русском, корейском или арабском.' },
			{ title: 'Ремонт мебели', text: 'Помимо продажи, мы реставрируем и ремонтируем мебель, чтобы она служила годами.' },
		],
		stepsTitle: 'Как это работает',
		steps: [
			{ title: 'Выберите', text: 'Ищите по категории, материалу, цвету и цене.' },
			{ title: 'В корзину', text: 'Сравнивайте товары и сохраняйте избранное.' },
			{ title: 'Оформите заказ', text: 'Оформление за минуты и онлайн-отслеживание.' },
			{ title: 'Получите', text: 'Мы доставим мебель и всё согласуем с вами.' },
		],
		storyEyebrow: 'Кто мы',
		storyTitle: 'Мебель, с которой уютно, где бы вы ни были',
		storyText:
			'Zinfurn начался с простой идеи: люди, живущие вдали от дома, заслуживают простой и честный способ обустроить своё пространство. Сегодня платформа объединяет продавцов, агентов и покупателей — с понятными ценами, реальными фото и поддержкой на вашем языке.',
		faqTitle: 'Частые вопросы',
		ctaTitle: 'Готовы найти что-то новое?',
		ctaText: 'Загляните в каталог и создайте пространство, которое вам нравится.',
	},
	kr: {
		eyebrow: '우리의 이야기',
		browse: '가구 둘러보기',
		contact: '문의하기',
		statsProducts: '상품',
		statsAgents: '신뢰할 수 있는 에이전트',
		statsSince: '서비스 시작',
		statsLanguages: '지원 언어',
		valuesTitle: '고객이 Zinfurn을 선택하는 이유',
		values: [
			{ title: '엄선된 품질', text: '모든 상품은 등록 전 상태, 소재, 마감을 확인합니다.' },
			{ title: '문 앞까지 배송', text: '주문마다 배송을 준비하며 비용과 일정을 미리 안내합니다.' },
			{ title: '원하는 언어로', text: '우즈베크어, 영어, 러시아어, 한국어, 아랍어로 쇼핑하고 지원받으세요.' },
			{ title: '수리 서비스', text: '판매뿐 아니라 가구를 수리·복원하여 오래 사용할 수 있게 합니다.' },
		],
		stepsTitle: '이용 방법',
		steps: [
			{ title: '선택', text: '카테고리, 소재, 색상, 가격으로 찾아보세요.' },
			{ title: '장바구니', text: '상품을 비교하고 즐겨찾기에 저장하세요.' },
			{ title: '주문', text: '몇 분 만에 결제하고 온라인으로 추적하세요.' },
			{ title: '수령', text: '가구를 배송하고 모든 것을 함께 확인합니다.' },
		],
		storyEyebrow: '우리는 누구인가',
		storyTitle: '어디에 있든 집처럼 편안한 가구',
		storyText:
			'Zinfurn은 단순한 생각에서 시작했습니다. 고향을 떠나 사는 사람들도 쉽고 정직하게 공간을 꾸밀 수 있어야 한다는 것입니다. 지금은 판매자, 에이전트, 고객을 하나의 플랫폼에서 연결합니다 — 명확한 가격, 실제 사진, 그리고 모국어 지원과 함께.',
		faqTitle: '자주 묻는 질문',
		ctaTitle: '새로운 가구를 찾을 준비가 되셨나요?',
		ctaText: '카탈로그를 둘러보고 마음에 드는 공간을 만들어 보세요.',
	},
	ar: {
		eyebrow: 'قصتنا',
		browse: 'تصفح الأثاث',
		contact: 'تواصل معنا',
		statsProducts: 'منتج',
		statsAgents: 'وكلاء موثوقون',
		statsSince: 'نعمل منذ',
		statsLanguages: 'لغات',
		valuesTitle: 'لماذا يختار العملاء Zinfurn',
		values: [
			{ title: 'جودة مختارة', text: 'يتم فحص كل منتج من حيث الحالة والمواد والتشطيب قبل عرضه.' },
			{ title: 'توصيل حتى الباب', text: 'يتم ترتيب التوصيل لكل طلب مع تأكيد التكلفة والموعد مسبقاً.' },
			{ title: 'بلغتك', text: 'تسوّق واحصل على الدعم بالأوزبكية أو الإنجليزية أو الروسية أو الكورية أو العربية.' },
			{ title: 'خدمة الإصلاح', text: 'إلى جانب البيع، نقوم بترميم الأثاث وإصلاحه ليدوم سنوات.' },
		],
		stepsTitle: 'كيف يعمل',
		steps: [
			{ title: 'اختر', text: 'ابحث حسب الفئة والمادة واللون والسعر.' },
			{ title: 'أضف إلى السلة', text: 'قارن المنتجات واحفظ المفضلة.' },
			{ title: 'اطلب', text: 'أكمل الطلب في دقائق وتابعه عبر الإنترنت.' },
			{ title: 'استلم', text: 'نوصل الأثاث ونؤكد كل شيء معك.' },
		],
		storyEyebrow: 'من نحن',
		storyTitle: 'أثاث يشعرك بالبيت أينما كنت',
		storyText:
			'بدأ Zinfurn بفكرة بسيطة: من يعيشون بعيداً عن الوطن يستحقون طريقة سهلة وصادقة لتأثيث مساحتهم. اليوم تجمع المنصة البائعين والوكلاء والعملاء في مكان واحد — بأسعار واضحة وصور حقيقية ودعم بلغتك.',
		faqTitle: 'الأسئلة الشائعة',
		ctaTitle: 'هل أنت مستعد لاختيار قطعتك التالية؟',
		ctaText: 'استكشف الكتالوج واصنع مساحة تحبها.',
	},
};
