/**
 * Bakes real-world scale into the bundled AR GLB files.
 *
 * Scene Viewer / Quick Look interpret GLB units as metres and ignore any scaling the
 * page applies, so the models have to ship at true size. Each model is scaled so its
 * largest floor-plane dimension matches the declared real width, then dropped so its
 * lowest point sits at y = 0.
 *
 * Usage: node scripts/normalizeArModels.mjs [--dry]
 */
import { NodeIO, getBounds } from '@gltf-transform/core';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MODELS_DIR = path.resolve('public/models');
const CONFIG_PATH = path.resolve('libs/config/arModels.ts');
const DRY_RUN = process.argv.includes('--dry');
/** A mesh thinner than this relative to its footprint is treated as a ground plane, not furniture */
const FLATNESS_THRESHOLD = 0.02;
/** Sketchfab exports name their ground plane FLOOR; real furniture parts never do */
const FLOOR_NAME_PATTERN = /floor/i;

const listDescendants = (node) => node.listChildren().flatMap((child) => [child, ...listDescendants(child)]);

/** Pulls id/url/realWidth out of the TS catalog so the script has a single source of truth */
const readCatalog = async () => {
	const source = await readFile(CONFIG_PATH, 'utf8');
	const entries = [...source.matchAll(/\{\s*id:\s*'([^']+)'[^}]*?url:\s*`\$\{MODELS_BASE_PATH\}\/([^`]+)`[^}]*?realWidth:\s*([\d.]+)/g)];
	if (!entries.length) throw new Error('No AR models found in libs/config/arModels.ts');
	return entries.map(([, id, file, realWidth]) => ({ id, file, realWidth: Number(realWidth) }));
};

const main = async () => {
	const io = new NodeIO();
	const catalog = await readCatalog();

	for (const { id, file, realWidth } of catalog) {
		const filePath = path.join(MODELS_DIR, file);
		const document = await io.read(filePath);
		const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];

		// These Sketchfab exports ship a large flat "FLOOR" plane that both dominates the
		// bounding box and renders as a visible disc under the furniture in AR.
		const dropped = [];
		for (const node of scene.listChildren()) {
			for (const descendant of [node, ...listDescendants(node)]) {
				const mesh = descendant.getMesh();
				if (!mesh) continue;

				const name = `${descendant.getName()} ${mesh.getName()}`;
				if (!FLOOR_NAME_PATTERN.test(name)) continue;

				const bounds = getBounds(descendant);
				const height = bounds.max[1] - bounds.min[1];
				const footprint = Math.max(bounds.max[0] - bounds.min[0], bounds.max[2] - bounds.min[2]);
				if (footprint === 0 || height / footprint >= FLATNESS_THRESHOLD) continue;

				// Detach only the mesh — a floor node can be the parent of the real furniture
				descendant.setMesh(null);
				dropped.push(descendant.getName() || '(unnamed)');
			}
		}

		const before = getBounds(scene);
		const size = before.max.map((value, axis) => value - before.min[axis]);
		const footprint = Math.max(size[0], size[2]);
		if (!footprint) {
			console.warn(`${id}: empty bounds, skipped`);
			continue;
		}

		const factor = realWidth / footprint;
		for (const node of scene.listChildren()) {
			node.setScale(node.getScale().map((value) => value * factor));
			node.setTranslation(node.getTranslation().map((value) => value * factor));
		}

		// Rest the model on the floor plane
		const scaled = getBounds(scene);
		for (const node of scene.listChildren()) {
			const [x, y, z] = node.getTranslation();
			node.setTranslation([x, y - scaled.min[1], z]);
		}

		const finalSize = getBounds(scene).max.map((value, axis) => value - getBounds(scene).min[axis]);
		console.log(
			`${id}: ${size.map((n) => n.toFixed(2)).join(' x ')} -> ${finalSize.map((n) => n.toFixed(2)).join(' x ')} m` +
				`${dropped.length ? ` | dropped: ${dropped.join(', ')}` : ''}`,
		);

		if (!DRY_RUN) await io.write(filePath, document);
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
