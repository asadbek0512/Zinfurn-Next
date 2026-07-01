import type { NextApiRequest, NextApiResponse } from 'next';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GQL_URL = process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007';

const LANG_NAME: Record<string, string> = { uz: 'Uzbek', en: 'English', ru: 'Russian', kr: 'Korean', ar: 'Arabic' };

// Kunlik limit: bir IP kuniga 10 ta xabar
const DAILY_LIMIT = 10;
const rateMap = new Map<string, { count: number; day: string }>();

function checkRateLimit(ip: string): boolean {
	const day = new Date().toISOString().slice(0, 10);
	const rec = rateMap.get(ip);
	if (!rec || rec.day !== day) {
		rateMap.set(ip, { count: 1, day });
		return true;
	}
	if (rec.count >= DAILY_LIMIT) return false;
	rec.count += 1;
	return true;
}

const LIMIT_MSG: Record<string, string> = {
	uz: "Bugungi AI suhbat chegarasiga yetdingiz (kuniga 10 ta). Ertaga yana urinib ko'ring 🙂",
	en: "You've reached today's AI chat limit (10 messages/day). Please come back tomorrow 🙂",
	ru: 'Вы достигли дневного лимита AI-чата (10 сообщений в день). Возвращайтесь завтра 🙂',
	kr: '오늘의 AI 채팅 한도(하루 10개)에 도달했습니다. 내일 다시 이용해 주세요 🙂',
	ar: 'لقد وصلت إلى حد الدردشة اليومي (10 رسائل في اليوم). يرجى العودة غدًا 🙂',
};

interface CatalogItem {
	_id: string;
	propertyTitle: string;
	propertyCategory?: string;
	propertyType?: string;
	propertyMaterial?: string;
	propertyColor?: string;
	propertyPrice?: number;
	propertySalePrice?: number;
	propertyImages?: string[];
	propertyTranslations?: Record<string, { title?: string }>;
}

const localizedTitle = (p: CatalogItem, locale: string): string =>
	p.propertyTranslations?.[locale]?.title?.trim() || p.propertyTitle;

/** Bazadan mahsulot katalogini olamiz (AI real mahsulotlarni tavsiya qilishi uchun) */
async function fetchCatalog(): Promise<CatalogItem[]> {
	const query = `query { getProperties(input:{ page:1, limit:60, sort:"propertyRank", direction:DESC, search:{} }) {
		list { _id propertyTitle propertyCategory propertyType propertyMaterial propertyColor propertyPrice propertySalePrice propertyImages
			propertyTranslations { uz{title} en{title} ru{title} kr{title} ar{title} } } } }`;
	try {
		const r = await fetch(GQL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
		const d = await r.json();
		return d?.data?.getProperties?.list || [];
	} catch {
		return [];
	}
}

interface AiAction {
	label: string;
	href: string;
}

const ALLOWED_HREFS = ['/property', '/repairService', '/community', '/agent', '/cs', '/mypage', '/checkout', '/account/join'];

const cleanActions = (raw: any): AiAction[] =>
	(Array.isArray(raw) ? raw : [])
		.filter((a) => a && typeof a.label === 'string' && typeof a.href === 'string' && ALLOWED_HREFS.some((h) => a.href.startsWith(h)))
		.slice(0, 3)
		.map((a) => ({ label: a.label, href: a.href }));

/** Groq (llama-3.3-70b) — JSON: { reply, productIds, actions } */
async function askGroq(systemPrompt: string, history: { role: string; content: string }[]): Promise<{ reply: string; productIds: string[]; actions: AiAction[] }> {
	const messages = [
		{ role: 'system', content: systemPrompt },
		...history.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
	];
	const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
		body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, response_format: { type: 'json_object' }, temperature: 0.55 }),
	});
	if (!r.ok) throw new Error('Groq ' + r.status + ': ' + (await r.text()).slice(0, 150));
	const data = await r.json();
	const parsed = JSON.parse(data.choices[0].message.content);
	return {
		reply: parsed.reply || '',
		productIds: Array.isArray(parsed.productIds) ? parsed.productIds : [],
		actions: cleanActions(parsed.actions),
	};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

	const { messages, locale } = req.body as { messages: { role: string; content: string }[]; locale: string };
	const lang = LANG_NAME[locale] || 'English';

	// Kunlik limit tekshiruvi (IP bo'yicha)
	const ip =
		((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() ||
		req.socket?.remoteAddress ||
		'unknown';
	if (!checkRateLimit(ip)) {
		return res.status(200).json({ reply: LIMIT_MSG[locale] || LIMIT_MSG.en, products: [], actions: [] });
	}

	try {
		const catalog = await fetchCatalog();
		const catalogText = catalog
			.map(
				(p) =>
					`- id:${p._id} | ${localizedTitle(p, locale)} | category:${p.propertyCategory} | type:${p.propertyType} | material:${p.propertyMaterial} | color:${p.propertyColor} | price:$${p.propertySalePrice || p.propertyPrice}`,
			)
			.join('\n');

		const systemPrompt = `You are Zinfurn's expert AI interior-design shopping assistant. You understand colour theory, materials and furniture styling like a professional designer.
Always answer ONLY in ${lang}, in a warm, personal, elegant tone — as a real interior designer would speak to a client.

CURRENT CATALOG (each line includes the product's colour & material — these are the ONLY products that exist):
${catalogText || '(catalog empty)'}

HOW TO HELP:
1. Understand the user's space & taste from their words: room colour, style, mood, the item they want, budget.
2. Reason like a real interior designer — match by COLOUR HARMONY and material, NOT just the item name:
   - For a GREEN room, harmonious choices are natural WOOD/BROWN, BEIGE, WHITE, warm neutrals, GRAY, or a deep GREEN — avoid clashing tones.
   - Generally: neutrals (white/beige/gray/wood) go with almost anything; pick tones that complement the user's colour.
   - Use each product's colour/material from the catalog to decide what truly fits.
3. Recommend ONLY 1-3 products that GENUINELY fit — never dump the whole list. If just one truly fits, recommend one. If nothing fits, say so kindly and describe what would suit them.
4. Put the chosen EXACT catalog ids into "productIds" (never invent ids).

REPLY STYLE (in ${lang}, 2-4 warm sentences, flowing text — no bullet lists, no prices, no ids):
- Acknowledge their space first, e.g. "Since your room is green...".
- Explain WHY the colour/material you chose suits it (short design reasoning).
- Then warmly introduce the recommended piece(s). Product cards are shown separately, so never repeat prices.

YOU ALSO KNOW THE WHOLE ZINFURN WEBSITE. When the user needs a section/service (not a specific product), guide them there with a button in "actions" (label in ${lang} + the page path). Site map:
- "/property" — browse & filter all furniture
- "/repairService" — Furniture Repair Service: request a repair, find technicians (use for "I need a repairman / fix my furniture / repair")
- "/community" — community blog & articles, tips
- "/agent" — our agents / sellers list
- "/cs" — customer support: notices, FAQ, terms (use for "help / support / FAQ / questions / policy")
- "/mypage" — user's page: profile, my orders, favorites, my listings, messages (use for "my account / my orders / my favorites")
- "/checkout" — checkout / payment
- "/account/join" — login or sign up (use for "log in / register / become a seller/agent")

RULES FOR ACTIONS:
- Add an action ONLY when it truly helps (a service or section the user asked for). Otherwise "actions": [].
- label = short friendly text in ${lang} (e.g. "Go to Repair Service"). href = exact path from the map.
- You can combine: a warm reply + product cards + action buttons when relevant.

For greetings/general questions: answer warmly, productIds [], actions [] (unless a section clearly helps).

Return ONLY JSON: {"reply": "...", "productIds": ["id1","id2"], "actions": [{"label":"...","href":"/..."}]}`;

		const cleanHistory = (messages || []).filter((m) => m?.content && m.content.trim());

		let reply = '';
		let productIds: string[] = [];
		let actions: AiAction[] = [];

		if (GROQ_API_KEY) {
			({ reply, productIds, actions } = await askGroq(systemPrompt, cleanHistory));
		} else if (GEMINI_API_KEY) {
			// Fallback: Gemini (JSON mode)
			const contents = [
				{ role: 'user', parts: [{ text: systemPrompt }] },
				{ role: 'model', parts: [{ text: 'OK' }] },
				...cleanHistory.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
			];
			const gr = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
				{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig: { responseMimeType: 'application/json', temperature: 0.4 } }) },
			);
			const gd = await gr.json();
			const raw = gd?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
			const parsed = JSON.parse(raw);
			reply = parsed.reply || '';
			productIds = Array.isArray(parsed.productIds) ? parsed.productIds : [];
			actions = cleanActions(parsed.actions);
		} else {
			return res.status(500).json({ error: 'No AI key configured' });
		}

		// productIds -> to'liq mahsulot (rasm, narx, nom)
		const byId = new Map(catalog.map((p) => [p._id, p]));
		const products = productIds
			.map((id) => byId.get(id))
			.filter(Boolean)
			.slice(0, 3)
			.map((p) => ({
				_id: p!._id,
				title: localizedTitle(p!, locale),
				price: p!.propertySalePrice || p!.propertyPrice || 0,
				originalPrice: p!.propertySalePrice ? p!.propertyPrice : null,
				image: p!.propertyImages?.[0] ? `${API_URL}/${p!.propertyImages[0]}` : '',
			}));

		return res.status(200).json({ reply: reply || '...', products, actions });
	} catch (error: any) {
		console.error('AI chat error:', error.message);
		return res.status(500).json({ error: error.message });
	}
}
