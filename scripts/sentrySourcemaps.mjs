/**
 * Build'dan keyin: source map'larni Sentry'ga yuklaydi va .map fayllarni o'chiradi
 * (kod ochiq serverda turmasin). SENTRY_AUTH_TOKEN yo'q bo'lsa (lokal / pre-push) — jim o'tkazib yuboradi.
 * Env: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const STATIC_DIR = join(process.env.NEXT_DIST_DIR || '.next', 'static');
const MAP_EXT = '.map';

if (!process.env.SENTRY_AUTH_TOKEN) {
	console.log('[sentry] SENTRY_AUTH_TOKEN yo\'q — source map yuklanmadi');
	process.exit(0);
}

const cli = createRequire(import.meta.url).resolve('@sentry/cli/bin/sentry-cli');
const run = (...args) => execFileSync(cli, args, { stdio: 'inherit' });

const removeMaps = (dir) => {
	let count = 0;
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) count += removeMaps(path);
		else if (name.endsWith(MAP_EXT)) {
			rmSync(path);
			count += 1;
		}
	}
	return count;
};

try {
	run('sourcemaps', 'inject', STATIC_DIR);
	run('sourcemaps', 'upload', STATIC_DIR);
} catch (err) {
	// Sentry ishlamasa ham deploy to'xtamasin
	console.error('[sentry] source map yuklashda xato:', err.message);
} finally {
	console.log(`[sentry] ${removeMaps(STATIC_DIR)} ta .map fayl o'chirildi`);
}
