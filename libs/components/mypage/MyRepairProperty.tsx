import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography, Card, CardContent, CardMedia, Box, Chip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useReactiveVar } from '@apollo/client';
import { T } from '../../types/common';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_TECHNICIAN_PROPERTIES } from '../../../apollo/user/mutation';
import { RepairPropertiesInquiry } from '../../types/repairProperty/repairProperty.input';
import { RepairProperty } from '../../types/repairProperty/repairProperty';
import { RepairPropertyStatus } from '../../enums/repairProperty.enum';

const MyRepairProperty: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<RepairPropertiesInquiry>(initialInput);
	const [technicianRepairProperties, setTechnicianRepairProperties] = useState<RepairProperty[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const {
		loading: getTechnicianRepairPropertiesLoading,
		data: getTechnicianRepairPropertiesData,
		error: getTechnicianRepairPropertiesError,
		refetch: getTechnicianRepairPropertiesRefetch,
	} = useQuery(GET_TECHNICIAN_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			setTechnicianRepairProperties(data?.getTechnicianProperties?.list);
			setTotal(data?.getTechnicianProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: RepairPropertyStatus) => {
		setSearchFilter({ ...searchFilter, search: { repairPropertyStatus: value } });
	};

	if (user?.memberType !== 'TECHNICIAN') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>NESTAR REPAIRPROPERTIES MOBILE</div>;
	} else {
		return (
			<div id="my-property-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My RepairProperties</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>

				<Stack className="property-list-box" sx={{ mt: -4 }}>
					<Stack className="list-box">
						{technicianRepairProperties?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No RepairProperty found!</p>
							</div>
						) : (
							<Stack spacing={3}>
								{technicianRepairProperties?.map((repairProperty: RepairProperty) => (
									<Card
										key={repairProperty._id}
										sx={{
											display: 'flex',
											minHeight: 200,
											boxShadow: 2,
											borderRadius: 2,
										}}
									>
										{' '}
										<CardMedia
											component="img"
											sx={{
												width: 300,
												height: 200,
												objectFit: 'cover',
											}}
											image={
												repairProperty.repairPropertyImages && repairProperty.repairPropertyImages.length > 0
													? `${process.env.REACT_APP_API_URL}/${repairProperty.repairPropertyImages[0]}`
													: '/img/default-property.jpg'
											}
											alt={repairProperty.repairPropertyType}
										/>
										<Box component={'div'} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
											<CardContent sx={{ flex: '1 0 auto', padding: 3 }}>
												<Box
													component={'div'}
													sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
												>
													<Typography
														component="h2"
														variant="h5"
														sx={{
															fontWeight: 'bold',
															color: '#2C3E50',
															mb: 1,
														}}
													>
														{repairProperty.repairPropertyType}
													</Typography>
													<Chip
														label="ACTIVE"
														size="small"
														sx={{
															fontWeight: 'bold',
															fontSize: '0.75rem',
															backgroundColor: '#cf6422',
															color: 'white',
														}}
													/>
												</Box>

												<Typography
													variant="body1"
													color="text.secondary"
													sx={{
														mb: 2,
														display: 'flex',
														alignItems: 'center',
														fontWeight: '500',
													}}
												>
													<Box
														component="span"
														sx={{
															display: 'inline-block',
															width: 8,
															height: 8,
															borderRadius: '50%',
															backgroundColor: '#E74C3C',
															mr: 1,
														}}
													/>
													{repairProperty.repairPropertyAddress}
												</Typography>

												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														lineHeight: 1.6,
														display: '-webkit-box',
														WebkitLineClamp: 3,
														WebkitBoxOrient: 'vertical',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
													}}
												>
													{repairProperty.repairPropertyDescription}
												</Typography>
											</CardContent>
										</Box>
									</Card>
								))}
							</Stack>
						)}

						{technicianRepairProperties?.length !== 0 && (
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
									<Typography>{total} property available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyRepairProperty.defaultProps = {
	initialInput: {
		page: 1,
		limit: 3,
		sort: 'createdAt',
		search: {
			repairPropertyStatus: 'ACTIVE',
		},
	},
};

export default MyRepairProperty;
