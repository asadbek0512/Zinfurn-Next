import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { Rating } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import { compareVar } from '../apollo/store';
import { GET_PROPERTY } from '../apollo/user/query';
import { Property } from '../libs/types/property/property';
import { REACT_APP_API_URL } from '../libs/config';
import { removeFromCompare, clearCompare } from '../libs/utils/compareUtils';
import { addToCart } from '../libs/utils/cartUtils';
import { getLocalizedTitle } from '../libs/utils/localizeProperty';
import { activeSalePrice } from '../libs/utils/sale';
import { useCurrency } from '../libs/context/CurrencyContext';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

interface CompareRow {
	label: string;
	render: (p: Property) => React.ReactNode;
	/** Farq qiluvchi qiymatlarni ajratib ko'rsatish uchun solishtiriladigan qiymat */
	value?: (p: Property) => string | number | undefined;
}

const Compare: NextPage = () => {
	const { t, i18n } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const client = useApolloClient();
	const ids = useReactiveVar(compareVar);
	const [properties, setProperties] = useState<Property[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!ids.length) {
			setProperties([]);
			return;
		}
		let cancelled = false;
		const load = async () => {
			setLoading(true);
			const results = await Promise.all(
				ids.map(async (id) => {
					try {
						const { data } = await client.query({ query: GET_PROPERTY, variables: { input: id }, fetchPolicy: 'cache-first' });
						return (data?.getProperty as Property) ?? null;
					} catch {
						// O'chirilgan mahsulot — ro'yxatdan chiqariladi
						removeFromCompare(id);
						return null;
					}
				}),
			);
			if (!cancelled) {
				setProperties(results.filter((p): p is Property => !!p));
				setLoading(false);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [ids, client]);

	const priceOf = (p: Property) => activeSalePrice(p) || p.propertyPrice;
	const minPrice = properties.length ? Math.min(...properties.map(priceOf)) : 0;

	const rows: CompareRow[] = [
		{
			label: t('Price'),
			render: (p) => (
				<span className={properties.length > 1 && priceOf(p) === minPrice ? 'cmp-best' : ''}>{formatPrice(priceOf(p))}</span>
			),
			value: priceOf,
		},
		{
			label: t('Rating'),
			render: (p) => (
				<span className="cmp-rating">
					<Rating readOnly size="small" value={p.propertyRating || 0} precision={0.1} />
					{p.propertyReviews || 0}
				</span>
			),
			value: (p) => p.propertyRating,
		},
		{ label: t('Category'), render: (p) => t(p.propertyCategory), value: (p) => p.propertyCategory },
		{ label: t('Type'), render: (p) => t(p.propertyType), value: (p) => p.propertyType },
		{ label: t('Material'), render: (p) => t(p.propertyMaterial), value: (p) => p.propertyMaterial },
		{
			label: t('Color'),
			render: (p) => (
				<span className="cmp-color">
					<i style={{ backgroundColor: p.propertyColor?.toLowerCase() }} />
					{t(p.propertyColor)}
				</span>
			),
			value: (p) => p.propertyColor,
		},
		{ label: t('Size'), render: (p) => p.propertySize || '—', value: (p) => p.propertySize },
		{ label: t('Condition'), render: (p) => t(p.propertyCondition), value: (p) => p.propertyCondition },
		{ label: t('Brand'), render: (p) => p.propertyBrand || '—', value: (p) => p.propertyBrand },
		{ label: t('Origin'), render: (p) => p.propertyOriginCountry || '—', value: (p) => p.propertyOriginCountry },
		{
			label: t('Stock'),
			render: (p) => (p.propertyInStock === false ? t('sold_out') : t('In stock')),
			value: (p) => String(p.propertyInStock !== false),
		},
	];

	const isDifferent = (row: CompareRow) =>
		!!row.value && properties.length > 1 && new Set(properties.map((p) => String(row.value?.(p) ?? ''))).size > 1;

	if (!ids.length) {
		return (
			<div className="compare-page">
				<div className="compare-empty">
					<h2>{t('Compare products')}</h2>
					<p>{t('Add up to 3 products to compare them side by side.')}</p>
					<Link href="/products" className="cmp-btn">
						{t('Browse products')}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="compare-page">
			<div className="compare-head">
				<h2>{t('Compare products')}</h2>
				<button type="button" className="cmp-clear" onClick={clearCompare}>
					{t('Clear all')}
				</button>
			</div>

			{loading && !properties.length ? (
				<div className="compare-empty">{t('Loading...')}</div>
			) : (
				<div className="compare-scroll">
					<table className="compare-table">
						<thead>
							<tr>
								<th />
								{properties.map((p) => (
									<th key={p._id}>
										<div className="cmp-product">
											<button type="button" className="cmp-remove" aria-label={t('Remove')} onClick={() => removeFromCompare(p._id)}>
												<CloseIcon sx={{ fontSize: 16 }} />
											</button>
											<Link href={{ pathname: '/products/detail', query: { id: p._id } }}>
												{p.propertyImages?.[0] ? (
													<img src={`${REACT_APP_API_URL}/${p.propertyImages[0]}`} alt={getLocalizedTitle(p, i18n.language)} />
												) : (
													<span className="cmp-noimg" />
												)}
												<span className="cmp-title">{getLocalizedTitle(p, i18n.language)}</span>
											</Link>
											<button
												type="button"
												className="cmp-btn"
												disabled={p.propertyInStock === false}
												onClick={() =>
													addToCart({
														_id: p._id,
														propertyTitle: getLocalizedTitle(p, i18n.language),
														propertyPrice: p.propertyPrice,
														propertySalePrice: activeSalePrice(p),
														propertyImages: p.propertyImages,
														propertyType: p.propertyType,
														memberNick: p.memberData?.memberNick,
													})
												}
											>
												{t('Add to Cart')}
											</button>
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.label} className={isDifferent(row) ? 'cmp-diff' : ''}>
									<td className="cmp-label">{row.label}</td>
									{properties.map((p) => (
										<td key={p._id}>{row.render(p)}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default withLayoutBasic(Compare);
