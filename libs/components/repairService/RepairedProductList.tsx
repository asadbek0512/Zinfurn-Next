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
import { GET_REPAIRPRODUCTS } from '../../../apollo/user/query';
import { T, getErrorMessage } from '../../types/common';
import { LIKE_TARGET_REPAIRPRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { RepairProductsInquiry } from '../../types/repairProduct/repairProduct.input';
import { RepairProduct } from '../../types/repairProduct/repairProduct';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CommentIcon from '@mui/icons-material/Comment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from 'next-i18next';

interface RepairProductsGridProps {
	initialInput: RepairProductsInquiry;
}

const RepairProductsGrid = (props: RepairProductsGridProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const [repairProducts, setRepairProducts] = useState<RepairProduct[]>([]);
	const [searchFilter, setSearchFilter] = useState<RepairProductsInquiry>(initialInput);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetRepairProduct] = useMutation(LIKE_TARGET_REPAIRPRODUCT);

	const {
		loading: getRepairProductsLoading,
		data: getRepairProductsData,
		error: getRepairProductsError,
		refetch: getRepairProductsRefetch,
	} = useQuery(GET_REPAIRPRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRepairProducts(data?.getRepairProducts?.list);
			setTotal(data?.getRepairProducts?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const likeRepairProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(t(Message.NOT_AUTHENTICATED));

			await likeTargetRepairProduct({ variables: { input: id } });
			await getRepairProductsRefetch({ input: searchFilter });
			sweetTopSmallSuccessAlert(t('Successfully updated!'), 700);
		} catch (err: unknown) {
			console.error('ERROR, likeRepairProductHandler', getErrorMessage(err));
			sweetMixinErrorAlert(getErrorMessage(err)).then();
		}
	};

	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/repairService/detail', query: { id: productId } });
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


	if (device === 'mobile') {
		return (
			<div className="mob-repair-list-section">
				<div className="mob-repair-list-header">
					<p className="mob-repair-list-title">{t('Repaired Products')}</p>
					<p className="mob-repair-list-sub">{t('Professional repairs by skilled craftsmen')}</p>
				</div>

				<div className="mob-repair-cards">
					{repairProducts.map((repairProduct: RepairProduct) => {
						const imageUrl = `${REACT_APP_API_URL}/${repairProduct?.repairProductImages?.[0] || ''}`;
						const avatarSrc = repairProduct?.memberData?.memberImage?.startsWith('http')
							? repairProduct.memberData.memberImage
							: `${REACT_APP_API_URL}/${repairProduct?.memberData?.memberImage || ''}`;

						return (
							<div key={repairProduct._id} className="mob-repair-card" onClick={() => pushDetailHandler(repairProduct._id)}>
								<div className="mob-repair-card-craftsman">
									<img src={avatarSrc} alt="" className="mob-repair-avatar" loading="lazy" decoding="async" />
									<div>
										<p className="mob-repair-craftsman-name">{repairProduct?.memberData?.memberNick}</p>
										<p className="mob-repair-craftsman-role">{t('Technician')}</p>
									</div>
								</div>

								<img src={imageUrl} alt="" className="mob-repair-card-img" loading="lazy" decoding="async" />

								<div className="mob-repair-card-content">
									<span
										className="mob-repair-type-chip"
										style={{ backgroundColor: getRepairTypeColor(repairProduct.repairProductType) }}
									>
										{t(repairProduct.repairProductType)}
									</span>
									<p className="mob-repair-desc">{repairProduct.repairProductDescription}</p>
									<div className="mob-repair-address">
										<LocationOnIcon />
										<span>{repairProduct.repairProductAddress}</span>
									</div>
									<div className="mob-repair-stats">
										<div className="mob-repair-stats-left">
											<span className="mob-repair-stat">
												<RemoveRedEyeIcon />
												{repairProduct.repairProductViews}
											</span>
											<span className="mob-repair-stat">
												<CommentIcon />
												{repairProduct.repairProductComments}
											</span>
										</div>
										<button
											className={`mob-repair-like-btn ${repairProduct?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
											onClick={(e) => { e.stopPropagation(); likeRepairProductHandler(user, repairProduct._id); }}
										>
											<FavoriteIcon />
											{repairProduct.repairProductLikes}
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{total > 0 && (
					<div className="mob-repair-pagination">
						<Pagination
							page={searchFilter.page}
							count={Math.ceil(total / searchFilter.limit)}
							onChange={handlePaginationChange}
							shape="circular"
							color="primary"
							size="small"
						/>
						<span className="mob-repair-total">{t('Total {{total}} repair product{{plural}} available', { total, plural: total !== 1 ? 's' : '' })}</span>
					</div>
				)}
			</div>
		);
	}

	return (
		<Stack className={'repair-products-grid'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'header'}>
					<Typography variant="h4" component="h2" className={'main-title'}>
						{t('Repaired Products')}
					</Typography>
					<Typography variant="subtitle1" className={'subtitle'}>
						{t('Professional repairs by skilled craftsmen')}
					</Typography>
				</Box>

				<Grid container spacing={3} className={'furniture-grid'}>
					{repairProducts.map((repairProduct: RepairProduct) => {
						const imageUrl = `${REACT_APP_API_URL}/${repairProduct?.repairProductImages?.[0] || ''}`;

						return (
							<Grid item xs={12} sm={6} md={4} key={repairProduct._id}>
								<Card className={'furniture-card'} onClick={() => pushDetailHandler(repairProduct._id)}>
									{/* Craftsman info header - Instagram style */}
									<Box component={'div'} className={'craftsman-header'}>
										<Avatar
											src={repairProduct?.memberData?.memberImage?.startsWith('http') ? `${repairProduct?.memberData?.memberImage}` : `${REACT_APP_API_URL}/${repairProduct?.memberData?.memberImage || ''}`}
											className={'craftsman-avatar'}
										>
											<PersonIcon />
										</Avatar>
										<Box component={'div'} className={'craftsman-info'}>
											<Typography variant="body2" className={'craftsman-name'}>
												{repairProduct?.memberData?.memberNick}
											</Typography>
											<Typography variant="caption" className={'craftsman-role'}>
												{t('Technician')}
											</Typography>
										</Box>
									</Box>

									{/* Image */}
									<Box component={'div'} className={'image-container'}>
										<CardMedia
											component="img"
											className={'furniture-image'}
											image={imageUrl}
											alt={repairProduct.repairProductDescription}
										/>
									</Box>

									{/* Card content */}
									<CardContent className={'card-content'}>
										{/* Type chip */}
										<Chip
											label={t(repairProduct.repairProductType)}
											size="small"
											className={'type-chip'}
											style={{
												backgroundColor: getRepairTypeColor(repairProduct.repairProductType),
												color: 'white',
											}}
										/>

										{/* Description */}
										<Typography variant="h6" component="h3" className={'product-description'}>
											{repairProduct.repairProductDescription}
										</Typography>

										{/* Address */}
										<Box component={'div'} className={'product-address'}>
											<LocationOnIcon className={'location-icon'} />
											<Typography variant="body2" className={'address-text'}>
												{repairProduct.repairProductAddress}
											</Typography>
										</Box>

										<Divider className={'divider'} />

										{/* Stats */}
										<Box component={'div'} className={'product-stats'}>
											<Box component={'div'} className={'stats-left'}>
												<Box component={'div'} className={'stat-item'}>
													<IconButton size="small" className={'stat-icon'}>
														<RemoveRedEyeIcon fontSize="small" />
													</IconButton>
													<Typography variant="caption" className={'stat-count'}>
														{repairProduct.repairProductViews}
													</Typography>
												</Box>

												<Box component={'div'} className={'stat-item'}>
													<IconButton size="small" className={'stat-icon'}>
														<CommentIcon fontSize="small" />
													</IconButton>
													<Typography variant="caption" className={'stat-count'}>
														{repairProduct.repairProductComments}
													</Typography>
												</Box>
											</Box>

											<Box component={'div'} className={'stats-right'}>
												<IconButton
													size="small"
													className={`like-button ${repairProduct?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
													onClick={(e) => {
														e.stopPropagation();
														likeRepairProductHandler(user, repairProduct._id);
													}}
													aria-label={repairProduct?.meLiked?.[0]?.myFavorite ? t('Unlike') : t('Like')}
												>
													<FavoriteIcon fontSize="small" />
												</IconButton>
												<Typography variant="caption" className={'stat-count'}>
													{repairProduct.repairProductLikes}
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
					{repairProducts.length > 0 && (
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

					{repairProducts.length > 0 && (
						<Stack className="total-result">
							<Typography>
								{t('Total {{total}} repair product{{plural}} available', {
									total,
									plural: total !== 1 ? 's' : '',
								})}
							</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

RepairProductsGrid.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		direction: 'DESC',
		search: {},
	},
};

export default RepairProductsGrid;
