import { Document, WebIO, getBounds } from '@gltf-transform/core';

/**
 * Scales a GLB to a real-world width and rests it on the floor plane.
 *
 * Scene Viewer and Quick Look read GLB units as metres and ignore any scaling applied by
 * the page, so real-world size has to be baked into the file itself. Generated models
 * (Meshy/Tripo) come out in arbitrary units, hence this runs on every import.
 *
 * Mirrors scripts/normalizeArModels.mjs, which does the same for the bundled stand-ins.
 */

/** A mesh thinner than this relative to its footprint is a ground plane, not furniture */
const FLATNESS_THRESHOLD = 0.02;
const FLOOR_NAME_PATTERN = /floor/i;

type SceneNode = ReturnType<Document['createNode']>;

const listDescendants = (node: SceneNode): SceneNode[] =>
	node.listChildren().flatMap((child) => [child, ...listDescendants(child)]);

export const normalizeGlb = async (input: Uint8Array, realWidthMeters: number): Promise<Uint8Array> => {
	const io = new WebIO();
	const document = await io.readBinary(input);
	const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
	if (!scene) throw new Error('GLB has no scene');

	for (const root of scene.listChildren()) {
		for (const node of [root, ...listDescendants(root)]) {
			const mesh = node.getMesh();
			if (!mesh) continue;
			if (!FLOOR_NAME_PATTERN.test(`${node.getName()} ${mesh.getName()}`)) continue;

			const bounds = getBounds(node);
			const height = bounds.max[1] - bounds.min[1];
			const footprint = Math.max(bounds.max[0] - bounds.min[0], bounds.max[2] - bounds.min[2]);
			if (footprint === 0 || height / footprint >= FLATNESS_THRESHOLD) continue;

			// Detach only the mesh — a floor node can be the parent of the real furniture
			node.setMesh(null);
		}
	}

	const bounds = getBounds(scene);
	const footprint = Math.max(bounds.max[0] - bounds.min[0], bounds.max[2] - bounds.min[2]);
	if (!footprint) throw new Error('GLB has empty bounds');

	const factor = realWidthMeters / footprint;
	for (const node of scene.listChildren()) {
		node.setScale(node.getScale().map((value) => value * factor) as [number, number, number]);
		node.setTranslation(node.getTranslation().map((value) => value * factor) as [number, number, number]);
	}

	const scaled = getBounds(scene);
	for (const node of scene.listChildren()) {
		const [x, y, z] = node.getTranslation();
		node.setTranslation([x, y - scaled.min[1], z]);
	}

	return io.writeBinary(document);
};
