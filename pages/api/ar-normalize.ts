import type { NextApiRequest, NextApiResponse } from 'next';
import { normalizeGlb } from '../../libs/utils/normalizeGlb';

/**
 * Scales a hand-uploaded GLB to the product's real width.
 *
 * @gltf-transform/core reaches for `node:fs` when bundled, so normalisation cannot run in
 * the browser — the admin panel posts the raw bytes here and uploads the response through
 * the regular `modelUploader` mutation.
 */

const MAX_MODEL_BYTES = 25 * 1024 * 1024;
/** Next.js only accepts literals in the exported `config`, so the limit is repeated here */
const BODY_SIZE_LIMIT = '25mb';
const MIN_WIDTH_CM = 5;
const MAX_WIDTH_CM = 500;
const CM_PER_METER = 100;

export const config = {
	api: {
		bodyParser: { type: 'application/octet-stream', sizeLimit: BODY_SIZE_LIMIT },
		responseLimit: false,
	},
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const width = Number(req.query.realWidthCm);
	if (!Number.isFinite(width) || width < MIN_WIDTH_CM || width > MAX_WIDTH_CM) {
		return res.status(400).json({ error: `realWidthCm must be between ${MIN_WIDTH_CM} and ${MAX_WIDTH_CM}` });
	}

	const raw = req.body;
	if (!Buffer.isBuffer(raw) || !raw.byteLength) return res.status(400).json({ error: 'GLB body is required' });
	if (raw.byteLength > MAX_MODEL_BYTES) return res.status(413).json({ error: 'Model is too large' });

	try {
		const normalized = await normalizeGlb(new Uint8Array(raw), width / CM_PER_METER);
		res.setHeader('Content-Type', 'model/gltf-binary');
		return res.status(200).send(Buffer.from(normalized));
	} catch (error) {
		return res.status(422).json({ error: (error as Error).message });
	}
};

export default handler;
