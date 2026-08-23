import type { NextApiRequest, NextApiResponse } from 'next';
import { normalizeGlb } from '../../libs/utils/normalizeGlb';

/**
 * Downloads a generated GLB, scales it to the product's real width and returns the bytes.
 *
 * The browser cannot fetch the generator's CDN directly (no CORS) and the model arrives in
 * arbitrary units, so both steps happen here. The admin panel then uploads the returned
 * bytes through the regular `modelUploader` mutation, which keeps a single validated
 * write path into `uploads/`.
 */

/** Only generator CDNs may be fetched — this endpoint must not become an open proxy */
const ALLOWED_MODEL_HOSTS = ['assets.meshy.ai', 'api.meshy.ai'];
const MAX_MODEL_BYTES = 25 * 1024 * 1024;
const MIN_WIDTH_CM = 5;
const MAX_WIDTH_CM = 500;
const CM_PER_METER = 100;

export const config = { api: { responseLimit: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { modelUrl, realWidthCm } = req.body ?? {};
	if (typeof modelUrl !== 'string') return res.status(400).json({ error: 'modelUrl is required' });

	const width = Number(realWidthCm);
	if (!Number.isFinite(width) || width < MIN_WIDTH_CM || width > MAX_WIDTH_CM) {
		return res.status(400).json({ error: `realWidthCm must be between ${MIN_WIDTH_CM} and ${MAX_WIDTH_CM}` });
	}

	let parsed: URL;
	try {
		parsed = new URL(modelUrl);
	} catch {
		return res.status(400).json({ error: 'modelUrl is not a valid URL' });
	}
	if (parsed.protocol !== 'https:' || !ALLOWED_MODEL_HOSTS.includes(parsed.hostname)) {
		return res.status(400).json({ error: 'modelUrl host is not allowed' });
	}

	const response = await fetch(parsed.toString());
	if (!response.ok) return res.status(502).json({ error: 'Could not download the model' });

	const raw = new Uint8Array(await response.arrayBuffer());
	if (raw.byteLength > MAX_MODEL_BYTES) return res.status(413).json({ error: 'Model is too large' });

	try {
		const normalized = await normalizeGlb(raw, width / CM_PER_METER);
		res.setHeader('Content-Type', 'model/gltf-binary');
		return res.status(200).send(Buffer.from(normalized));
	} catch (error) {
		return res.status(422).json({ error: (error as Error).message });
	}
};

export default handler;
