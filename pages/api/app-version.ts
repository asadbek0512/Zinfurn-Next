import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextApiRequest, NextApiResponse } from 'next';

/** Hozir serverda turgan build — client o'zinikidan farq qilsa "yangi versiya tayyor" ko'rsatadi */
const BUILD_ID_PATH = join(process.cwd(), process.env.NEXT_DIST_DIR || '.next', 'BUILD_ID');

const readBuildId = (): string | null => {
	try {
		return readFileSync(BUILD_ID_PATH, 'utf8').trim();
	} catch {
		return null;
	}
};

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
	res.setHeader('Cache-Control', 'no-store');
	res.status(200).json({ buildId: readBuildId() });
}
