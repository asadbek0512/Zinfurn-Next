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
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface FlashSaleProps {
    initialInput: PropertiesInquiry;
}

const FlashSale = (props: FlashSaleProps) => {
    const { initialInput } = props;
    const device = useDeviceDetect();
    const [flashSaleProperties, setFlashSaleProperties] = useState<Property[]>([]);

    /** APOLLO REQUESTS **/
    const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

    const {
        loading: getPropertiesLoading,
        data: getPropertiesData,
        error: getPropertiesError,
        refetch: getPropertiesRefetch,
    } = useQuery(GET_PROPERTIES, {
        fetchPolicy: 'cache-and-network',
        variables: { input: initialInput },
        notifyOnNetworkStatusChange: true,
        onCompleted: (data: T) => {
            console.log('FlashSale - Query completed:', data);
            console.log('FlashSale - Properties list:', data?.getProperties?.list);
            setFlashSaleProperties(data?.getProperties?.list);
        },
        onError: (error) => {
            console.log('FlashSale - Query error:', error);
        }
    });

    /** HANDLERS **/
    const likePropertyHandler = async (user: T, id: string) => {
        try {
            if (!id) return;
            if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
            
            // Execute likeTargetProperty Mutation
            await likeTargetProperty({ variables: { input: id } });
            
            // Execute getPropertiesRefetch
            await getPropertiesRefetch({ input: initialInput });
            await sweetTopSmallSuccessAlert('success', 800);
        } catch (err: any) {
            console.log('ERROR, likePropertyHandler', err.message);
            sweetMixinErrorAlert(err.message).then();
        }
    };

    // Debug logs
    console.log('FlashSale - initialInput:', initialInput);
    console.log('FlashSale - flashSaleProperties:', flashSaleProperties);
    console.log('FlashSale - loading:', getPropertiesLoading);
    console.log('FlashSale - error:', getPropertiesError);

    if (getPropertiesError) {
        console.error('FlashSale GraphQL Error:', getPropertiesError);
        return (
            <Box component={'div'} style={{ padding: '20px', color: 'red' }}>
                Error loading flash sale properties: {getPropertiesError.message}
            </Box>
        );
    }

    if (getPropertiesLoading) {
        return (
            <Box component={'div'} style={{ padding: '20px' }}>
                Loading flash sale properties...
            </Box>
        );
    }

    return (
        <Box component={'div'}>
            <FlashSaleCards properties={flashSaleProperties} likePropertyHandler={likePropertyHandler} />
        </Box>
    );
};

FlashSale.defaultProps = {
    initialInput: {
        page: 1,
        limit: 6,
				sort: 'createdAt',     
        direction: 'DESC',
        search: {},
    },
};

export default FlashSale;