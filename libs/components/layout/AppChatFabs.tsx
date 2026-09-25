import React from 'react';
import { useTranslation } from 'next-i18next';
import useAppMode from '../../hooks/useAppMode';

/**
 * Mobil Chat/AiChat komponentlari o'z suzuvchi tugmasini chizmaydi — ular yon
 * menyudagi tugmalar yuboradigan event bilan ochilardi. App'da yon menyu yo'q,
 * shuning uchun PC'dagidek doim ko'rinib turadigan tugmalar shu yerda beriladi.
 */
const AppChatFabs = () => {
	const appMode = useAppMode();
	const { t } = useTranslation('common');

	if (!appMode) return null;

	const fire = (eventName: string) => window.dispatchEvent(new CustomEvent(eventName));

	return (
		<div className={'app-chat-fabs'}>
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
