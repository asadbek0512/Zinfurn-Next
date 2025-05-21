import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { useMutation, useQuery } from '@apollo/client';
import { GET_REPAIRPROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_REPAIRPROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common_enum';
import { RepairPropertiesInquiry } from '../../types/repairProperty/repairProperty.input';
import { RepairProperty } from '../../types/repairProperty/repairProperty';
import TopRepairPropertyCard from './RepairedPropertyCard';

interface TopRepairPropertiesProps {
  initialInput: RepairPropertiesInquiry;
}

const TopRepairProperties = (props: TopRepairPropertiesProps) => {
  const { initialInput } = props;
  const device = useDeviceDetect();
  const [topRepairProperties, setTopRepairProperties] = useState<RepairProperty[]>([]);

  /** APOLLO REQUESTS **/
  const [likeTargetRepairProperty] = useMutation(LIKE_TARGET_REPAIRPROPERTY);

  const {
    loading: getRepairPropertiesLoading,
    data: getRepairPropertiesData,
    error: getRepairPropertiesError,
    refetch: getRepairPropertiesRefetch,
  } = useQuery(GET_REPAIRPROPERTIES, {
    fetchPolicy: 'cache-and-network',
    variables: { input: initialInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setTopRepairProperties(data?.getRepairProperties?.list);
    },
  });

  /** HANDLERS **/
  const likeRepairPropertyHandler = async (user: T, id: string) => {
    try {
      if (!id) return;
      if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

      // execute likeRepairProperty Mutation
      await likeTargetRepairProperty({ variables: { input: id } });

      // refetch updated data
      await getRepairPropertiesRefetch({ input: initialInput });

      await sweetTopSmallSuccessAlert('success', 800);
    } catch (err: any) {
      console.log('ERROR, likeRepairPropertyHandler', err.message);
      sweetMixinErrorAlert(err.message).then();
    }
  };


  return (
    <Stack className={'top-repair-properties'}>
      <Stack className={'container'}>
        <Stack className={'info-box'}>
          <Box component={'div'} className={'left'}>
            <span>Top Repair Properties</span>
            <p>Check out our Top Repair Properties</p>
          </Box>
          <Box component={'div'} className={'right'}>
            <div className={'pagination-box'}>
              <WestIcon className={'swiper-top-repair-prev'} />
              <div className={'swiper-top-repair-pagination'}></div>
              <EastIcon className={'swiper-top-repair-next'} />
            </div>
          </Box>
        </Stack>
        <Stack className={'card-box'}>
          <Swiper
            className={'top-repair-property-swiper'}
            slidesPerView={'auto'}
            spaceBetween={15}
            modules={[Autoplay, Navigation, Pagination]}
            navigation={{
              nextEl: '.swiper-top-repair-next',
              prevEl: '.swiper-top-repair-prev',
            }}
            pagination={{
              el: '.swiper-top-repair-pagination',
            }}
          >
            {topRepairProperties.map((repairProperty: RepairProperty) => (
              <SwiperSlide className={'top-repair-property-slide'} key={repairProperty?._id}>
                <TopRepairPropertyCard
                  repairProperty={repairProperty}
                  likeRepairPropertyHandler={likeRepairPropertyHandler}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Stack>
      </Stack>
    </Stack>

  );
}

TopRepairProperties.defaultProps = {
  initialInput: {
    page: 1,
    limit: 8,
    direction: 'DESC',
    search: {},
  },
};

export default TopRepairProperties;
