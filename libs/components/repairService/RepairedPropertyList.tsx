import React, { ChangeEvent, useState } from 'react';
import {
	Stack,
	Box,
	Grid,
	Card,
	CardMedia,
	CardContent,
	Typography,
	IconButton,
	Chip,
	Avatar,
	Divider,
	Pagination,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useMutation, useQuery } from '@apollo/client';
import { GET_REPAIRPROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_REPAIRPROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common_enum';
import { RepairPropertiesInquiry } from '../../types/repairProperty/repairProperty.input';
import { RepairProperty } from '../../types/repairProperty/repairProperty';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CommentIcon from '@mui/icons-material/Comment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';

interface RepairPropertiesGridProps {
	initialInput: RepairPropertiesInquiry;
}

const RepairPropertiesGrid = (props: RepairPropertiesGridProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [repairProperties, setRepairProperties] = useState<RepairProperty[]>([]);
	const [searchFilter, setSearchFilter] = useState<RepairPropertiesInquiry>(initialInput);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetRepairProperty] = useMutation(LIKE_TARGET_REPAIRPROPERTY);

	const {
		loading: getRepairPropertiesLoading,
		data: getRepairPropertiesData,
		error: getRepairPropertiesError,
		refetch: getRepairPropertiesRefetch,
	} = useQuery(GET_REPAIRPROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRepairProperties(data?.getRepairProperties?.list);
			setTotal(data?.getRepairProperties?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const likeRepairPropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetRepairProperty({ variables: { input: id } });
			await getRepairPropertiesRefetch({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, likeRepairPropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const pushDetailHandler = async (propertyId: string) => {
		await router.push({ pathname: '/repair/detail', query: { id: propertyId } });
	};

  const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const newFilter = { ...searchFilter, page: value };
		setSearchFilter(newFilter);

	};

	const getRepairTypeColor = (type: string) => {
		switch (type) {
			case 'FURNITURE':
				return '#2196F3';
			case 'ELECTRONICS':
				return '#FF9800';
			case 'APPLIANCES':
				return '#4CAF50';
			default:
				return '#757575';
		}
	};

	const getRepairTypeText = (type: string) => {
		switch (type) {
			case 'FURNITURE':
				return 'Furniture';
			case 'ELECTRONICS':
				return 'Electronics';
			case 'APPLIANCES':
				return 'Appliances';
			default:
				return type;
		}
	};

	return (
		<Stack className={'repair-properties-grid'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'header'}>
					<Typography variant="h4" component="h2" className={'main-title'}>
						Repaired Properties
					</Typography>
					<Typography variant="subtitle1" className={'subtitle'}>
						Professional repairs by skilled craftsmen
					</Typography>
				</Box>

				<Grid container spacing={3} className={'properties-grid'}>
					{repairProperties.map((repairProperty: RepairProperty) => {
						const imageUrl = `${REACT_APP_API_URL}/${repairProperty?.repairPropertyImages?.[0] || ''}`;

						return (
							<Grid item xs={12} sm={6} md={4} key={repairProperty._id}>
								<Card className={'property-card'} onClick={() => pushDetailHandler(repairProperty._id)}>
									{/* Craftsman info header - Instagram style */}
									<Box component={'div'} className={'craftsman-header'}>
										<Avatar
											src={`${REACT_APP_API_URL}/${repairProperty?.memberData?.memberImage || ''}`}
											className={'craftsman-avatar'}
										>
											<PersonIcon />
										</Avatar>
										<Box component={'div'} className={'craftsman-info'}>
											<Typography variant="body2" className={'craftsman-name'}>
												{repairProperty?.memberData?.memberNick}
											</Typography>
											<Typography variant="caption" className={'craftsman-role'}>
												Technician
											</Typography>
										</Box>
									</Box>

									{/* Image */}
									<Box component={'div'} className={'image-container'}>
										<CardMedia
											component="img"
											className={'property-image'}
											image={imageUrl}
											alt={repairProperty.repairPropertyDescription}
										/>
									</Box>

									{/* Card content */}
									<CardContent className={'card-content'}>
										{/* Type chip */}
										<Chip
											label={getRepairTypeText(repairProperty.repairPropertyType)}
											size="small"
											className={'type-chip'}
											style={{
												backgroundColor: getRepairTypeColor(repairProperty.repairPropertyType),
												color: 'white',
											}}
										/>

										{/* Description */}
										<Typography variant="h6" component="h3" className={'property-description'}>
											{repairProperty.repairPropertyDescription}
										</Typography>

										{/* Address */}
										<Box component={'div'} className={'property-address'}>
											<LocationOnIcon className={'location-icon'} />
											<Typography variant="body2" className={'address-text'}>
												{repairProperty.repairPropertyAddress}
											</Typography>
										</Box>

										<Divider className={'divider'} />

										{/* Stats */}
										<Box component={'div'} className={'property-stats'}>
											<Box component={'div'} className={'stats-left'}>
												<Box component={'div'} className={'stat-item'}>
													<IconButton size="small" className={'stat-icon'}>
														<RemoveRedEyeIcon fontSize="small" />
													</IconButton>
													<Typography variant="caption" className={'stat-count'}>
														{repairProperty.repairPropertyViews}
													</Typography>
												</Box>

												<Box component={'div'} className={'stat-item'}>
													<IconButton size="small" className={'stat-icon'}>
														<CommentIcon fontSize="small" />
													</IconButton>
													<Typography variant="caption" className={'stat-count'}>
														{repairProperty.repairPropertyComments}
													</Typography>
												</Box>
											</Box>

											<Box component={'div'} className={'stats-right'}>
												<IconButton
													size="small"
													className={`like-button ${repairProperty?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
													onClick={(e) => {
														e.stopPropagation();
														likeRepairPropertyHandler(user, repairProperty._id);
													}}
												>
													<FavoriteIcon fontSize="small" />
												</IconButton>
												<Typography variant="caption" className={'stat-count'}>
													{repairProperty.repairPropertyLikes}
												</Typography>
											</Box>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>

				<Stack className="pagination-config">
					{repairProperties.length > 0 && (
						<Stack className="pagination-box">
							<Pagination
								className="custom-pagination"
								page={searchFilter.page}
								count={Math.ceil(total / searchFilter.limit)}
								onChange={handlePaginationChange}
								shape="circular"
							/>
						</Stack>
					)}

					{repairProperties.length > 0 && (
						<Stack className="total-result">
							<Typography>
								Total {total} repair propert{total !== 1 ? 'ies' : 'y'} available
							</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

RepairPropertiesGrid.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		direction: 'DESC',
		search: {},
	},
};

export default RepairPropertiesGrid;