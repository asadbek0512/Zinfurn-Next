import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { compareVar } from '../../../apollo/store';
import { clearCompare, COMPARE_MAX, loadCompare } from '../../utils/compareUtils';

const HIDDEN_PATHS = new Set(['/compare', '/checkout']);

/** Solishtirishga mahsulot qo'shilganda pastda chiqadigan panel */
const CompareBar = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const ids = useReactiveVar(compareVar);

	useEffect(() => {
		loadCompare();
	}, []);

	if (!ids.length || HIDDEN_PATHS.has(router.pathname) || router.pathname.startsWith('/_admin')) return null;

	return (
		<div className="compare-bar">
			<CompareArrowsIcon sx={{ fontSize: 20 }} />
			<span>
				{t('Compare')} ({ids.length}/{COMPARE_MAX})
			</span>
			<Link href="/compare" className="compare-bar-go">
				{t('Compare now')}
			</Link>
			<button type="button" className="compare-bar-clear" aria-label={t('Clear all')} onClick={clearCompare}>
				✕
			</button>
		</div>
	);
};

export default CompareBar;
