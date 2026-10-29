import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductCard } from './ProductCard';
import RowSkeleton from '../common/RowSkeleton';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Product } from '../../types/product/product';
import { AgentProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { ProductStatus } from '../../enums/product.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_AGENT_PRODUCTS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

const MyProducts: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<AgentProductsInquiry>(initialInput);
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const {
		loading: getAgentProductsLoading,
		data: getAgentProductsData,
		error: getAgentProductsError,
		refetch: getAgentProductsRefetch,
	} = useQuery(GET_AGENT_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		variables: { input: searchFilter },
		onCompleted: (data) => {
			setAgentProducts(data?.getAgentProducts?.list);
			setTotal(data?.getAgentProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ProductStatus) => {
		setSearchFilter({ ...searchFilter, search: { productStatus: value } });
	};

	const deleteProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert(t('Are you sure to delete this product?'))) {
				await updateProduct({
					variables: {
						input: {
							_id: id,
							productStatus: 'DELETE',
						},
					},
				});
			}
			await getAgentProductsRefetch({ input: searchFilter });
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		}
	};

	const updateProductHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(t('Are you sure to change to {{status}} status?', { status }))) {
				await updateProduct({
					variables: {
						input: {
							_id: id,
							productStatus: status,
						},
					},
				});
			}
			await getAgentProductsRefetch({ input: searchFilter });
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		}
	};

	// Agent mahsulotni "tugadi / bor" holatiga o'tkazadi
	const toggleStockHandler = async (inStock: boolean, id: string) => {
		try {
			await updateProduct({
				variables: {
					input: {
						_id: id,
						productInStock: inStock,
					},
				},
			});
			await getAgentProductsRefetch({ input: searchFilter });
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return (
			<div id="mob-myproducts">
				<div className="mob-myprop-header">
					<h2>{t('My Products')}</h2>
					<span>{t('We are glad to see you again!')}</span>
				</div>
				<div className="mob-myprop-tabs">
					<div
						className={`mob-myprop-tab${searchFilter.search.productStatus === 'ACTIVE' ? ' active' : ''}`}
						onClick={() => changeStatusHandler(ProductStatus.ACTIVE)}
					>
						{t('On Sale')}
					</div>
					<div
						className={`mob-myprop-tab${searchFilter.search.productStatus === 'SOLD' ? ' active' : ''}`}
						onClick={() => changeStatusHandler(ProductStatus.SOLD)}
					>
						{t('On Sold')}
					</div>
				</div>
				<div className="mob-myprop-list">
					{getAgentProductsLoading && !agentProducts.length ? (
						Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
					) : agentProducts?.length === 0 ? (
						<div className="mob-myprop-empty">
							<img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
							<span>{t('No Products found!')}</span>
						</div>
					) : (
						agentProducts.map((product: Product) => (
							<ProductCard
								key={product._id}
								product={product}
								deleteProductHandler={deleteProductHandler}
								updateProductHandler={updateProductHandler}
								toggleStockHandler={toggleStockHandler}
							/>
						))
					)}
				</div>
				{agentProducts.length > 0 && (
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
			</div>
		);
	} else {
		return (
			<div id="my-product-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{t('My Products')}</Typography>
						<Typography className="sub-title">{t('We are glad to see you again!')}</Typography>
					</Stack>
				</Stack>
				<Stack className="product-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(ProductStatus.ACTIVE)}
							className={searchFilter.search.productStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							{t('On Sale')}
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(ProductStatus.SOLD)}
							className={searchFilter.search.productStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							{t('On Sold')}
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">{t('Listing title')}</Typography>
							<Typography className="title-text">{t('Date Published')}</Typography>
							<Typography className="title-text">{t('Status')}</Typography>
							<Typography className="title-text">{t('View')}</Typography>
							{searchFilter.search.productStatus === 'ACTIVE' && (
								<Typography className="title-text">{t('Action')}</Typography>
							)}
						</Stack>

						{getAgentProductsLoading && !agentProducts.length ? (
							Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
						) : agentProducts?.length === 0 ? (
							<div
								className="no-data"
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									marginLeft: '250px',
									marginTop: '58px',
								}}
							>
								<img src="/img/icons/icoAlert.svg" alt="" style={{ width: '60px', height: '60px' }} loading="lazy" decoding="async" />
								<p style={{ fontSize: '18px', color: 'var(--text-2)', marginTop: '8px', marginLeft: '45px' }}>
									{t('No Products found!')}
								</p>
							</div>
						) : (
							agentProducts.map((product: Product) => {
								return (
									<ProductCard
										product={product}
										deleteProductHandler={deleteProductHandler}
										updateProductHandler={updateProductHandler}
										toggleStockHandler={toggleStockHandler}
									/>
								);
							})
						)}

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
			productStatus: 'ACTIVE',
		},
	},
};

export default MyProducts;
