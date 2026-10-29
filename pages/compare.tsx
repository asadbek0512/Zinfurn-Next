import React, { CSSProperties, useEffect, useState } from 'react';
import StarRating from '../libs/components/common/StarRating';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import { compareVar } from '../apollo/store';
import { GET_PRODUCT } from '../apollo/user/query';
import { Product } from '../libs/types/product/product';
import { REACT_APP_API_URL } from '../libs/config';
import { removeFromCompare, clearCompare } from '../libs/utils/compareUtils';
import { addToCart } from '../libs/utils/cartUtils';
import { getLocalizedTitle } from '../libs/utils/localizeProduct';
import { activeSalePrice } from '../libs/utils/sale';
import { useCurrency } from '../libs/context/CurrencyContext';
import { LocaleContext, DEFAULT_LOCALE } from '../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

interface CompareRow {
	label: string;
	render: (p: Product) => React.ReactNode;
	/** Farq qiluvchi qiymatlarni ajratib ko'rsatish uchun solishtiriladigan qiymat */
	value?: (p: Product) => string | number | undefined;
}

const Compare: NextPage = () => {
	const { t, i18n } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const client = useApolloClient();
	const ids = useReactiveVar(compareVar);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!ids.length) {
			setProducts([]);
			return;
		}
		let cancelled = false;
		const load = async () => {
			setLoading(true);
			const results = await Promise.all(
				ids.map(async (id) => {
					try {
						const { data } = await client.query({ query: GET_PRODUCT, variables: { input: id }, fetchPolicy: 'cache-first' });
						return (data?.getProduct as Product) ?? null;
					} catch {
						// O'chirilgan mahsulot — ro'yxatdan chiqariladi
						removeFromCompare(id);
						return null;
					}
				}),
			);
			if (!cancelled) {
				setProducts(results.filter((p): p is Product => !!p));
				setLoading(false);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [ids, client]);

	const priceOf = (p: Product) => activeSalePrice(p) || p.productPrice;
	const minPrice = products.length ? Math.min(...products.map(priceOf)) : 0;

	const rows: CompareRow[] = [
		{
			label: t('Price'),
			render: (p) => (
				<span className={products.length > 1 && priceOf(p) === minPrice ? 'cmp-best' : ''}>{formatPrice(priceOf(p))}</span>
			),
			value: priceOf,
		},
		{
			label: t('Rating'),
			render: (p) => (
				<span className="cmp-rating">
					<StarRating value={p.productRating || 0} />
					{p.productReviews || 0}
				</span>
			),
			value: (p) => p.productRating,
		},
		{ label: t('Category'), render: (p) => t(p.productCategory), value: (p) => p.productCategory },
		{ label: t('Type'), render: (p) => t(p.productType), value: (p) => p.productType },
		{ label: t('Material'), render: (p) => t(p.productMaterial), value: (p) => p.productMaterial },
		{
			label: t('Color'),
			render: (p) => (
				<span className="cmp-color">
					<i style={{ backgroundColor: p.productColor?.toLowerCase() }} />
					{t(p.productColor)}
				</span>
			),
			value: (p) => p.productColor,
		},
		{ label: t('Size'), render: (p) => p.productSize || '—', value: (p) => p.productSize },
		{ label: t('Condition'), render: (p) => t(p.productCondition), value: (p) => p.productCondition },
		{ label: t('Brand'), render: (p) => p.productBrand || '—', value: (p) => p.productBrand },
		{ label: t('Origin'), render: (p) => p.productOriginCountry || '—', value: (p) => p.productOriginCountry },
		{
			label: t('Stock'),
			render: (p) => (p.productInStock === false ? t('sold_out') : t('In stock')),
			value: (p) => String(p.productInStock !== false),
		},
	];

	const isDifferent = (row: CompareRow) =>
		!!row.value && products.length > 1 && new Set(products.map((p) => String(row.value?.(p) ?? ''))).size > 1;

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

			{loading && !products.length ? (
				<div className="compare-empty">{t('Loading...')}</div>
			) : (
				<div className="compare-scroll">
					<table className="compare-table" style={{ '--cmp-cols': products.length } as CSSProperties}>
						<thead>
							<tr>
								<th />
								{products.map((p) => (
									<th key={p._id}>
										<div className="cmp-product">
											<button type="button" className="cmp-remove" aria-label={t('Remove')} onClick={() => removeFromCompare(p._id)}>
												<CloseIcon sx={{ fontSize: 16 }} />
											</button>
											<Link href={{ pathname: '/products/detail', query: { id: p._id } }}>
												{p.productImages?.[0] ? (
													<img src={`${REACT_APP_API_URL}/${p.productImages[0]}`} alt={getLocalizedTitle(p, i18n.language)} />
												) : (
													<span className="cmp-noimg" />
												)}
												<span className="cmp-title" title={getLocalizedTitle(p, i18n.language)}>{getLocalizedTitle(p, i18n.language)}</span>
											</Link>
											<button
												type="button"
												className="cmp-btn"
												disabled={p.productInStock === false}
												onClick={() =>
													addToCart({
														_id: p._id,
														productTitle: getLocalizedTitle(p, i18n.language),
														productPrice: p.productPrice,
														productSalePrice: activeSalePrice(p),
														productImages: p.productImages,
														productType: p.productType,
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
									{products.map((p) => (
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
