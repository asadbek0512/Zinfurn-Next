import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next'; // Tarjima uchun qo‘shildi
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T, getErrorMessage } from '../../types/common';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message, Direction } from '../../enums/common.enum';
import FlashSaleCards from './PopularProductCard';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface FlashSaleProps {
	initialInput: ProductsInquiry;
}

const FlashSale = (props: FlashSaleProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common'); // Tarjima funksiyasi
	const device = useDeviceDetect();
	// null — hali like bosilmagan: ro'yxat to'g'ridan-to'g'ri Apollo cache'dan olinadi (SSR bilan bir xil)
	const [likedProducts, setFlashSaleProducts] = useState<Product[] | null>(null);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onError: (error) => {
			console.error('FlashSale - Query error:', error);
		},
	});

	const flashSaleProducts: Product[] = likedProducts ?? getProductsData?.getProducts?.list ?? [];

	/** HANDLERS **/
	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			// Execute likeTargetProduct Mutation
			const result = await likeTargetProduct({ variables: { input: id } });

			// Refetch o'rniga faqat bosilgan kartani lokal yangilaymiz — ro'yxat "lip-lip" qilmasin
			const updatedLikes = result?.data?.likeTargetProduct?.productLikes;
			setFlashSaleProducts((prev) =>
				(prev ?? flashSaleProducts).map((p) =>
					p._id === id
						? {
								...p,
								productLikes: updatedLikes ?? p.productLikes,
								meLiked: p.meLiked?.[0]?.myFavorite
									? []
									: [{ memberId: user._id, likeRefId: id, myFavorite: true }],
						  }
						: p,
				),
			);
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: unknown) {
			console.error('ERROR, likeProductHandler', getErrorMessage(err));
			sweetMixinErrorAlert(getErrorMessage(err)).then();
		}
	};

	if (getProductsError) {
		console.error('FlashSale GraphQL Error:', getProductsError);
		return (
			<Box component={'div'} style={{ padding: '20px', color: 'red' }}>
				{t('Error loading flash sale products')}: {getProductsError.message}
			</Box>
		);
	}

	// Cache'da ma'lumot bo'lsa (getStaticProps prefetch) loading ko'rsatilmaydi — aks holda hydration mismatch
	if (getProductsLoading && !getProductsData) {
		return (
			<Box component={'div'} style={{ padding: '20px' }}>
				{t('Loading flash sale products')}...
			</Box>
		);
	}

	return (
		<Box component={'div'}>
			<FlashSaleCards products={flashSaleProducts} likeProductHandler={likeProductHandler} />
		</Box>
	);
};

// Home getStaticProps shu input bilan oldindan yuklaydi — cache kaliti mos kelishi uchun
export const FLASH_SALE_INPUT: ProductsInquiry = {
	page: 1,
	limit: 6,
	// Server AKTIV sale'larni beradi; eng tez tugaydiganlar birinchi (countdown mantiqi)
	sort: 'productSaleExpiresAt',
	direction: Direction.ASC,
	search: { productIsOnSale: true },
};

FlashSale.defaultProps = {
	initialInput: FLASH_SALE_INPUT,
};

export default FlashSale;
