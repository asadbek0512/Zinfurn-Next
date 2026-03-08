import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_API_KEY = 'AIzaSyBkWEfRnQjCXxDglWBNfrYL-59e3UwUzQY';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { messages, locale } = req.body; // 👈 locale qabul qilamiz

	// Tilga qarab system prompt
	const systemPrompts: Record<string, string> = {
		uz: "Sen Zinfurn mebel do'konining AI yordamchisisisan. Faqat mebel haqida O'zbek tilida qisqa javob ber.",
		en: "You are the AI assistant of Zinfurn furniture store. Only answer about furniture in English. Keep answers short.",
		ru: "Ты AI-помощник мебельного магазина Zinfurn. Отвечай только о мебели на русском языке. Отвечай коротко.",
		ar: "أنت مساعد الذكاء الاصطناعي لمتجر Zinfurn للأثاث. أجب فقط عن الأثاث باللغة العربية. أجب بإيجاز.",
		kr: "당신은 Zinfurn 가구점의 AI 도우미입니다. 가구에 대해서만 한국어로 짧게 답하세요.",
	};

	const systemPrompt = systemPrompts[locale] || systemPrompts['en'];

	try {
		const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
			role: msg.role === 'assistant' ? 'model' : 'user',
			parts: [{ text: msg.content }],
		}));

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					system_instruction: {
						parts: [{ text: systemPrompt }],
					},
					contents: geminiMessages,
				}),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return res.status(500).json({ error: data });
		}

		const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xatolik yuz berdi.";
		return res.status(200).json({ reply });

	} catch (error: any) {
		return res.status(500).json({ error: error.message });
	}
}