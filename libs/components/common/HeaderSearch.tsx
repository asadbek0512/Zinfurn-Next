import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useLazyQuery } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { getLocalizedTitle } from '../../utils/localizeProperty';
import { activeSalePrice } from '../../utils/sale';
import { useCurrency } from '../../context/CurrencyContext';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const SUGGESTION_LIMIT = 6;
const LIST_LIMIT = 9;

interface HeaderSearchProps {
	compact?: boolean;
}

const HeaderSearch = ({ compact = false }: HeaderSearchProps) => {
	const router = useRouter();
	const { t, i18n } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const [text, setText] = useState('');
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState(!compact);
	const [activeIndex, setActiveIndex] = useState(-1);
	const boxRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [fetchSuggestions, { data, loading }] = useLazyQuery(GET_PROPERTIES, { fetchPolicy: 'cache-first' });
	const trimmed = text.trim();
	const suggestions: Property[] = trimmed.length >= MIN_CHARS ? data?.getProperties?.list ?? [] : [];

	useEffect(() => {
		if (trimmed.length < MIN_CHARS) return;
		const timer = setTimeout(() => {
			fetchSuggestions({
				variables: {
					input: { page: 1, limit: SUGGESTION_LIMIT, sort: 'propertyViews', direction: 'DESC', search: { text: trimmed } },
				},
			});
		}, DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [trimmed, fetchSuggestions]);

	// Tashqariga bosilganda yopiladi
	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
				setOpen(false);
				if (compact && !text) setExpanded(false);
			}
		};
		document.addEventListener('mousedown', onClick);
		return () => document.removeEventListener('mousedown', onClick);
	}, [compact, text]);

	// Sahifa almashganda tozalanadi
	useEffect(() => {
		const reset = () => {
			setOpen(false);
			setActiveIndex(-1);
			if (compact) setExpanded(false);
		};
		router.events.on('routeChangeStart', reset);
		return () => router.events.off('routeChangeStart', reset);
	}, [router.events, compact]);

	const goToList = async () => {
		if (!trimmed) return;
		const input = { page: 1, limit: LIST_LIMIT, sort: 'createdAt', direction: 'DESC', search: { text: trimmed } };
		await router.push(`/products?input=${encodeURIComponent(JSON.stringify(input))}`);
		setText('');
	};

	const goToProduct = async (id: string) => {
		await router.push({ pathname: '/products/detail', query: { id } });
		setText('');
	};

	const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, -1));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (activeIndex >= 0 && suggestions[activeIndex]) await goToProduct(suggestions[activeIndex]._id);
			else await goToList();
		} else if (e.key === 'Escape') {
			setOpen(false);
			inputRef.current?.blur();
		}
	};

	if (compact && !expanded) {
		return (
			<button
				type="button"
				className="header-search-toggle"
				aria-label={t('Search')}
				onClick={() => {
					setExpanded(true);
					setTimeout(() => inputRef.current?.focus(), 0);
				}}
			>
				<SearchIcon className="notification-icon" />
			</button>
		);
	}

	const showDropdown = open && trimmed.length >= MIN_CHARS;

	return (
		<div ref={boxRef} className={`header-search${compact ? ' compact' : ''}`}>
			<SearchIcon className="header-search-icon" />
			<input
				ref={inputRef}
				type="search"
				value={text}
				placeholder={t('Search furniture...')}
				aria-label={t('Search')}
				onChange={(e) => {
					setText(e.target.value);
					setOpen(true);
					setActiveIndex(-1);
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={onKeyDown}
			/>
			{text && (
				<button type="button" className="header-search-clear" aria-label={t('Clear')} onClick={() => setText('')}>
					<CloseIcon sx={{ fontSize: 16 }} />
				</button>
			)}

			{showDropdown && (
				<div className="header-search-dropdown" role="listbox">
					{loading && !suggestions.length && <div className="hs-empty">{t('Loading...')}</div>}
					{!loading && !suggestions.length && <div className="hs-empty">{t('No results found')}</div>}
					{suggestions.map((p, idx) => {
						const sale = activeSalePrice(p);
						return (
							<div
								key={p._id}
								role="option"
								aria-selected={idx === activeIndex}
								className={`hs-item${idx === activeIndex ? ' active' : ''}`}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => goToProduct(p._id)}
							>
								{p.propertyImages?.[0] ? (
									<img src={`${REACT_APP_API_URL}/${p.propertyImages[0]}`} alt="" loading="lazy" />
								) : (
									<span className="hs-noimg" />
								)}
								<div className="hs-info">
									<span className="hs-title">{getLocalizedTitle(p, i18n.language)}</span>
									<span className="hs-meta">{t(p.propertyCategory)}</span>
								</div>
								<span className="hs-price">{formatPrice(sale || p.propertyPrice)}</span>
							</div>
						);
					})}
					{suggestions.length > 0 && (
						<button type="button" className="hs-all" onMouseDown={(e) => e.preventDefault()} onClick={goToList}>
							{t('See all results')} →
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default HeaderSearch;
