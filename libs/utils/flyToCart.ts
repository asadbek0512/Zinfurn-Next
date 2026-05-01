export function flyToCart(sourceEl: HTMLElement, imgSrc: string): void {
	const cartBtn = document.querySelector('.cart-nav-btn') as HTMLElement;
	if (!cartBtn) return;

	const srcRect = sourceEl.getBoundingClientRect();
	const dstRect = cartBtn.getBoundingClientRect();

	const fly = document.createElement('div');
	fly.style.cssText = `
		position: fixed;
		z-index: 999999;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		overflow: hidden;
		pointer-events: none;
		box-shadow: 0 4px 16px rgba(0,0,0,0.25);
		border: 2px solid #cf6422;
		background: #fff;
		left: ${srcRect.left + srcRect.width / 2 - 28}px;
		top: ${srcRect.top + srcRect.height / 2 - 28}px;
		transition: left 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
		            top 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94),
		            width 0.7s ease,
		            height 0.7s ease,
		            opacity 0.7s ease,
		            border-radius 0.7s ease;
	`;

	const img = document.createElement('img');
	img.src = imgSrc;
	img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
	fly.appendChild(img);
	document.body.appendChild(fly);

	// force reflow
	fly.getBoundingClientRect();

	const dstCx = dstRect.left + dstRect.width / 2;
	const dstCy = dstRect.top + dstRect.height / 2;

	fly.style.left = `${dstCx - 12}px`;
	fly.style.top = `${dstCy - 12}px`;
	fly.style.width = '24px';
	fly.style.height = '24px';
	fly.style.opacity = '0.3';
	fly.style.borderRadius = '50%';

	fly.addEventListener('transitionend', () => fly.remove(), { once: true });
}
