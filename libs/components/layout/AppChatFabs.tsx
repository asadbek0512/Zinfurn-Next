import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import useAppMode from '../../hooks/useAppMode';

// Pastga skroll qilinganda tugmalar kontentni (karta tugmalarini) to'smasin — yashiriladi
const SCROLL_DELTA = 8;
const ALWAYS_VISIBLE_TOP = 120;

/**
 * Mobil Chat/AiChat komponentlari o'z suzuvchi tugmasini chizmaydi — ular yon
 * menyudagi tugmalar yuboradigan event bilan ochilardi. App'da yon menyu yo'q,
 * shuning uchun PC'dagidek doim ko'rinib turadigan tugmalar shu yerda beriladi.
 */
const AppChatFabs = () => {
	const appMode = useAppMode();
	const { t } = useTranslation('common');
	const [hidden, setHidden] = useState(false);
	const lastY = useRef(0);

	useEffect(() => {
		if (!appMode) return;
		const onScroll = () => {
			const y = window.scrollY;
			const delta = y - lastY.current;
			if (Math.abs(delta) < SCROLL_DELTA) return;
			setHidden(delta > 0 && y > ALWAYS_VISIBLE_TOP);
			lastY.current = y;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, [appMode]);

	if (!appMode) return null;

	const fire = (eventName: string) => window.dispatchEvent(new CustomEvent(eventName));

	return (
		<div className={`app-chat-fabs${hidden ? ' is-hidden' : ''}`}>
			<button
				type="button"
				className={'app-fab app-fab-ai'}
				aria-label={t('AI Assistant')}
				onClick={() => fire('toggle-mob-ai')}
			>
				<img src="/img/ai1.webp" alt="" loading="lazy" decoding="async" />
			</button>
			<button
				type="button"
				className={'app-fab app-fab-chat'}
				aria-label={t('Live Chat')}
				onClick={() => fire('toggle-mob-chat')}
			>
				<img src="/img/banner/001..png" alt="" loading="lazy" decoding="async" />
			</button>
		</div>
	);
};

export default AppChatFabs;
