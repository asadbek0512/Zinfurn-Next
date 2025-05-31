import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import FlashSaleCards from './PopularPropertyCard';

interface FlashSaleProps {
	initialInput: PropertiesInquiry;
}

const FlashSale = (props: FlashSaleProps) => {
	const { initialInput } = props;
	const [flashSaleProperties, setFlashSaleProperties] = useState<Property[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	// Flash sale uchun filter - faqat sale bo'lgan propertylar
	const saleInput = {
		...initialInput,
		search: {
			...initialInput.search,
			propertyIsOnSale: true,
		},
	};

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: saleInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFlashSaleProperties(data?.getProperties?.list);
		},
	});

	/** HANDLERS **/
	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			// Execute likeTargetProperty Mutation
			await likeTargetProperty({ variables: { input: id } });

			// Execute getPropertiesRefetch
			await getPropertiesRefetch({ input: saleInput });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Box component={'div'}>
			<FlashSaleCards properties={flashSaleProperties} likePropertyHandler={likePropertyHandler} />
		</Box>
	);
};

FlashSale.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'propertyLikes',
		direction: 'DESC',
		search: {},
	},
};

export default FlashSale;
