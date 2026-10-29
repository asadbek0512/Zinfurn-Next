import React from 'react';
import { Stack, Box, Divider, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { RepairProduct } from '../../types/repairProduct/repairProduct';
import { useTranslation } from 'next-i18next';
import { getLocalizedRepairText } from '../../utils/localizeRepair';

interface TopRepairProductCardProps {
	repairProduct: RepairProduct;
	likeRepairProductHandler: any;
}

const TopRepairProductCard = (props: TopRepairProductCardProps) => {
	const { repairProduct, likeRepairProductHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');

	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/repairService/detail', query: { id: productId } });
	};

	const imageUrl = `${REACT_APP_API_URL}/${repairProduct?.repairProductImages?.[0] || ''}`;

	const Content = (
		<>
			<Box
				component="div"
				className="card-img"
				style={{ backgroundImage: `url(${imageUrl})`, cursor: 'pointer' }}
				onClick={() => pushDetailHandler(repairProduct._id)}
			>
				<div>{repairProduct?.memberData?.memberNick}</div>
			</Box>

			<Box component={'div'} className={'info'}>
				<strong className="title" style={{ cursor: 'pointer' }} onClick={() => pushDetailHandler(repairProduct._id)}>
					{getLocalizedRepairText(repairProduct, router.locale)}
				</strong>
				<p className={'desc'}>{repairProduct?.repairProductAddress}</p>
				<div className={'options'}>
					<div>
						<img src="/img/icons/bed.svg" alt={t('Product type')} loading="lazy" decoding="async" />
						<span>{t(repairProduct?.repairProductType || '')}</span>
					</div>
				</div>
				<Divider sx={{ mt: '15px', mb: '17px' }} />
				<div className={'bott'}>
					<div className="view-like-box">
						<IconButton color={'default'} aria-label={t('View count')}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{repairProduct?.repairProductViews}</Typography>
						<IconButton
							color={'default'}
							onClick={() => likeRepairProductHandler(user, repairProduct?._id)}
							aria-label={repairProduct?.meLiked?.[0]?.myFavorite ? t('Unlike') : t('Like')}
						>
							{repairProduct?.meLiked?.[0]?.myFavorite ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteIcon />}
						</IconButton>
						<Typography className="view-cnt">{repairProduct?.repairProductLikes}</Typography>
					</div>
				</div>
			</Box>
		</>
	);

	return <Stack className="top-card-box">{Content}</Stack>;
};

export default TopRepairProductCard;
