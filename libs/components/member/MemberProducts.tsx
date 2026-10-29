import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCard } from '../mypage/ProductCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { REACT_APP_API_URL } from '../../config';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';

const MyProducts: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>({ ...initialInput });
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setAgentProducts(data?.getProducts?.list);
			setTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getProductsRefetch().then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') {
		return (
			<div id="mob-member-products">
				{agentProducts?.length === 0 ? (
					<div className="mob-mem-empty">
						<img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
						<span>{t('No Products!')}</span>
					</div>
				) : (
					<div className="mob-mem-prop-grid">
						{agentProducts.map((product: Product) => {
							const imgSrc = product.productImages?.[0]
								? `${REACT_APP_API_URL}/${product.productImages[0]}`
								: '/img/banner/Home-1-.jpg';
							return (
								<div
									key={product._id}
									className="mob-mem-prop-card"
									onClick={() => router.push({ pathname: '/products/detail', query: { id: product._id } })}
								>
									<div className="mob-mem-prop-img">
										<img src={imgSrc} alt="" loading="lazy" decoding="async" />
										{product.productPrice && (
											<div className="mob-mem-prop-price">{formatPrice(product.productPrice)}</div>
										)}
									</div>
									<div className="mob-mem-prop-body">
										<div className="mob-mem-prop-title">{product.productTitle}</div>
										<div className="mob-mem-prop-meta">{t(product.productCategory || '')}</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
				{agentProducts?.length > 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFilter.limit)}
								page={searchFilter.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{t('Total {{total}} products', { total })}</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	} else {
		return (
			<div id="member-products-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{t('Products')}</Typography>
					</Stack>
				</Stack>
				<Stack className="products-list-box">
					<Stack className="list-box">
						{agentProducts?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">{t('Listing title')}</Typography>
								<Typography className="title-text">{t('Date Published')}</Typography>
								<Typography className="title-text">{t('Status')}</Typography>
								<Typography className="title-text">{t('View')}</Typography>
							</Stack>
						)}
						{agentProducts?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
								<p>{t('No Product found!')}</p>
							</div>
						)}
						{agentProducts?.map((product: Product) => {
							return <ProductCard product={product} memberPage={true} key={product?._id} />;
						})}

						{agentProducts.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{t('{{total}} product available', { total })}</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MyProducts;
