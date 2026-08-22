import { PropertyCategory } from '../enums/property.enum';

export interface ArModel {
	id: string;
	label: string;
	url: string;
	/** Real-world width in meters — used to auto-scale the GLB instead of magic scale factors */
	realWidth: number;
}

const MODELS_BASE_PATH = '/models';

export const AR_MODELS: ArModel[] = [
	{ id: 'armchair-gold', label: 'Gold Frame Armchair', url: `${MODELS_BASE_PATH}/armchair-gold.glb`, realWidth: 0.78 },
	{ id: 'armchair-yellow', label: 'Yellow Armchair', url: `${MODELS_BASE_PATH}/armchair-yellow.glb`, realWidth: 0.8 },
	{ id: 'armchair-blue', label: 'Blue Armchair', url: `${MODELS_BASE_PATH}/armchair-blue.glb`, realWidth: 0.82 },
	{ id: 'coffee-table-walnut', label: 'Walnut Coffee Table', url: `${MODELS_BASE_PATH}/coffee-table-walnut.glb`, realWidth: 1.1 },
	{ id: 'coffee-table-marble', label: 'Marble Coffee Table', url: `${MODELS_BASE_PATH}/coffee-table-marble.glb`, realWidth: 1.2 },
	{ id: 'side-tables-marble', label: 'Marble Side Tables', url: `${MODELS_BASE_PATH}/side-tables-marble.glb`, realWidth: 0.55 },
];

const DEFAULT_MODEL_ID = 'armchair-gold';

/** Keyword hints matched against a product title, most specific first */
const TITLE_HINTS: Array<{ keywords: string[]; modelId: string }> = [
	{ keywords: ['coffee table', 'jurnal stol'], modelId: 'coffee-table-walnut' },
	{ keywords: ['side table', 'nesting', 'tumba'], modelId: 'side-tables-marble' },
	{ keywords: ['table', 'stol', 'desk'], modelId: 'coffee-table-marble' },
	{ keywords: ['armchair', 'kreslo'], modelId: 'armchair-blue' },
	{ keywords: ['sofa', 'couch', 'divan'], modelId: 'armchair-blue' },
	{ keywords: ['chair', 'stul', 'kursi'], modelId: 'armchair-yellow' },
];

const CATEGORY_FALLBACK: Partial<Record<PropertyCategory, string>> = {
	[PropertyCategory.HOME]: 'armchair-gold',
	[PropertyCategory.OFFICE]: 'armchair-yellow',
	[PropertyCategory.OUTDOOR]: 'side-tables-marble',
	[PropertyCategory.KITCHEN]: 'coffee-table-walnut',
	[PropertyCategory.BATHROOM]: 'side-tables-marble',
};

export const getArModelById = (id: string): ArModel | undefined => AR_MODELS.find((model) => model.id === id);

/**
 * Picks the closest AR stand-in model for a product.
 * Products do not carry their own GLB yet, so we match on title keywords
 * and fall back to the product category.
 */
export const resolveArModel = (title?: string, category?: PropertyCategory): ArModel => {
	const normalizedTitle = (title ?? '').toLowerCase();

	if (normalizedTitle) {
		for (const hint of TITLE_HINTS) {
			if (hint.keywords.some((keyword) => normalizedTitle.includes(keyword))) {
				const matched = getArModelById(hint.modelId);
				if (matched) return matched;
			}
		}
	}

	const fallbackId = (category && CATEGORY_FALLBACK[category]) || DEFAULT_MODEL_ID;
	return getArModelById(fallbackId) ?? AR_MODELS[0];
};
