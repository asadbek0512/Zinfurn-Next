// Flash sale popup tayyor bo'lganini (ko'rsatildi yoki ko'rsatilmaydi) app loader'iga bildiradi —
// loader shunga qadar turadi, shunda home page va popup birdan chiqadi.
const PROMO_READY_EVENT = 'zin:promo-ready';
let promoReady = false;

export const markPromoReady = (): void => {
	if (promoReady || typeof window === 'undefined') return;
	promoReady = true;
	window.dispatchEvent(new Event(PROMO_READY_EVENT));
};

export const waitForPromoReady = async (maxWaitMs: number): Promise<void> => {
	if (promoReady) return;
	await new Promise<void>((resolve) => {
		const timer = setTimeout(resolve, maxWaitMs);
		window.addEventListener(
			PROMO_READY_EVENT,
			() => {
				clearTimeout(timer);
				resolve();
			},
			{ once: true },
		);
	});
};
