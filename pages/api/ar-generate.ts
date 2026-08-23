import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Image-to-3D generation for catalog products, via Meshy.
 *
 * POST { imageUrl }        -> { taskId }
 * GET  ?taskId=<id>        -> { status, progress, modelUrl? }
 *
 * The API key stays server-side; the admin panel only ever sees task ids.
 */

const MESHY_BASE_URL = 'https://api.meshy.ai/openapi/v1/image-to-3d';
const TARGET_POLYCOUNT = 30000;

type StartResponse = { taskId: string } | { error: string };
type StatusResponse = { status: string; progress: number; modelUrl?: string } | { error: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<StartResponse | StatusResponse>) => {
	const apiKey = process.env.MESHY_API_KEY;
	if (!apiKey) return res.status(500).json({ error: 'MESHY_API_KEY is not configured' });

	const authHeaders = { Authorization: `Bearer ${apiKey}` };

	if (req.method === 'POST') {
		const { imageUrl } = req.body ?? {};
		if (typeof imageUrl !== 'string' || !imageUrl) {
			return res.status(400).json({ error: 'imageUrl is required' });
		}

		const response = await fetch(MESHY_BASE_URL, {
			method: 'POST',
			headers: { ...authHeaders, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				image_url: imageUrl,
				should_texture: true,
				enable_pbr: true,
				target_polycount: TARGET_POLYCOUNT,
			}),
		});

		const payload = await response.json().catch(() => null);
		if (!response.ok) {
			return res.status(response.status).json({ error: payload?.message ?? 'Meshy request failed' });
		}
		return res.status(200).json({ taskId: payload.result });
	}

	if (req.method === 'GET') {
		const { taskId } = req.query;
		if (typeof taskId !== 'string') return res.status(400).json({ error: 'taskId is required' });

		const response = await fetch(`${MESHY_BASE_URL}/${encodeURIComponent(taskId)}`, { headers: authHeaders });
		const payload = await response.json().catch(() => null);
		if (!response.ok) {
			return res.status(response.status).json({ error: payload?.message ?? 'Meshy request failed' });
		}

		return res.status(200).json({
			status: payload.status,
			progress: payload.progress ?? 0,
			modelUrl: payload.model_urls?.glb,
		});
	}

	res.setHeader('Allow', 'GET, POST');
	return res.status(405).json({ error: 'Method not allowed' });
};

export default handler;
