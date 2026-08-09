import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from '../mypage/PropertyCard';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { REACT_APP_API_URL } from '../../config';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>({ ...initialInput });
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setAgentProperties(data?.getProperties?.list);
			setTotal(data?.getProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getPropertiesRefetch().then();
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
			<div id="mob-member-properties">
				{agentProperties?.length === 0 ? (
					<div className="mob-mem-empty">
						<img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
						<span>{t('No Properties!')}</span>
					</div>
				) : (
					<div className="mob-mem-prop-grid">
						{agentProperties.map((property: Property) => {
							const imgSrc = property.propertyImages?.[0]
								? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
								: '/img/banner/Home-1-.jpg';
							return (
								<div
									key={property._id}
									className="mob-mem-prop-card"
									onClick={() => router.push({ pathname: '/property/detail', query: { id: property._id } })}
								>
									<div className="mob-mem-prop-img">
										<img src={imgSrc} alt="" loading="lazy" decoding="async" />
										{property.propertyPrice && (
											<div className="mob-mem-prop-price">{formatPrice(property.propertyPrice)}</div>
										)}
									</div>
									<div className="mob-mem-prop-body">
										<div className="mob-mem-prop-title">{property.propertyTitle}</div>
										<div className="mob-mem-prop-meta">{t(property.propertyCategory || '')}</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
				{agentProperties?.length > 0 && (
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
							<Typography>{t('Total {{total}} properties', { total })}</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	} else {
		return (
			<div id="member-properties-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{t('Properties')}</Typography>
					</Stack>
				</Stack>
				<Stack className="properties-list-box">
					<Stack className="list-box">
						{agentProperties?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">{t('Listing title')}</Typography>
								<Typography className="title-text">{t('Date Published')}</Typography>
								<Typography className="title-text">{t('Status')}</Typography>
								<Typography className="title-text">{t('View')}</Typography>
							</Stack>
						)}
						{agentProperties?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
								<p>{t('No Property found!')}</p>
							</div>
						)}
						{agentProperties?.map((property: Property) => {
							return <PropertyCard property={property} memberPage={true} key={property?._id} />;
						})}

						{agentProperties.length !== 0 && (
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
									<Typography>{t('{{total}} property available', { total })}</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MyProperties;
