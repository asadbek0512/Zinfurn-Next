import React from 'react';

const MAX_STARS = 5;
const STARS = '★'.repeat(MAX_STARS);
const DEFAULT_SIZE = 18; // MUI Rating size="small" bilan bir xil
const EMPTY_COLOR = '#e0e0e0';

interface StarRatingProps {
	value: number;
	size?: number;
}

/**
 * Faqat ko'rsatish uchun reyting. MUI <Rating precision={0.1}> har yulduzga 2 ta SVG chizadi —
 * mahsulotlar ro'yxatida bu HTML'ni ~120KB ga shishirardi. Bu yerda 2 ta matn qatlami, xolos.
 */
const StarRating = ({ value, size = DEFAULT_SIZE }: StarRatingProps) => {
	const percent = Math.max(0, Math.min(MAX_STARS, value)) * (100 / MAX_STARS);
	return (
		<span
			role="img"
			aria-label={`${value.toFixed(1)} / ${MAX_STARS}`}
			style={{ position: 'relative', display: 'inline-block', fontSize: size, lineHeight: 1, letterSpacing: 1, color: EMPTY_COLOR }}
		>
			{STARS}
			<span style={{ position: 'absolute', inset: 0, width: `${percent}%`, overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--star)' }}>
				{STARS}
			</span>
		</span>
	);
};

export default StarRating;
