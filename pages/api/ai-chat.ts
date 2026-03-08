import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { messages, locale } = req.body;

	const systemPrompts: Record<string, string> = {
		uz: "Sen Zinfurn mebel do'konining AI yordamchisisisan. Faqat mebel haqida O'zbek tilida qisqa javob ber.",
		en: 'You are the AI assistant of Zinfurn furniture store. Only answer about furniture in English. Keep answers short.',
		ru: 'Ты AI-помощник мебельного магазина Zinfurn. Отвечай только о мебели на русском языке. Отвечай коротко.',
		ar: 'أنت مساعد الذكاء الاصطناعي لمتجر Zinfurn للأثاث. أجب فقط عن الأثاث باللغة العربية. أجب بإيجاز.',
		kr: '당신은 Zinfurn 가구점의 AI 도우미입니다. 가구에 대해서만 한국어로 짧게 답하세요.',
	};

	const systemPrompt = systemPrompts[locale] || systemPrompts['en'];

	try {
		const geminiMessages = messages
			.filter((msg: { role: string; content?: string }) => msg.content && msg.content.trim() !== '')
			.map((msg: { role: string; content: string }) => ({
				role: msg.role === 'assistant' ? 'model' : 'user',
				parts: [{ text: msg.content }],
			}));

		// System promptni birinchi user xabar sifatida qo'shamiz
		const contentsWithSystem = [
			{ role: 'user', parts: [{ text: systemPrompt }] },
			{ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
			...geminiMessages,
		];

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: contentsWithSystem,
				}),
			},
		);

		const data = await response.json();

		if (!response.ok) {
			console.error('Gemini xatosi:', JSON.stringify(data));
			return res.status(500).json({ error: data });
		}

		const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xatolik yuz berdi.';
		return res.status(200).json({ reply });
	} catch (error: any) {
		console.error('Server xatosi:', error.message);
		return res.status(500).json({ error: error.message });
	}
}
