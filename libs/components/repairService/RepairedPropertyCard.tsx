import React from 'react';
import { Stack, Box, Divider, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { RepairProperty } from '../../types/repairProperty/repairProperty';

interface TopRepairPropertyCardProps {
	repairProperty: RepairProperty;
	likeRepairPropertyHandler: any;
}

const TopRepairPropertyCard = (props: TopRepairPropertyCardProps) => {
	const { repairProperty, likeRepairPropertyHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const pushDetailHandler = async (propertyId: string) => {
		await router.push({ pathname: '/repairService/detail', query: { id: propertyId } });
	};

	const imageUrl = `${REACT_APP_API_URL}/${repairProperty?.repairPropertyImages?.[0] || ''}`;

	const Content = (
		<>
			<Box
				component="div"
				className="card-img"
				style={{ backgroundImage: `url(${imageUrl})`, cursor: 'pointer' }}
				onClick={() => pushDetailHandler(repairProperty._id)}
			>
				<div>{repairProperty?.memberData?.memberNick}</div>
			</Box>

			<Box component={'div'} className={'info'}>
				<strong className="title" style={{ cursor: 'pointer' }} onClick={() => pushDetailHandler(repairProperty._id)}>
					{repairProperty?.repairPropertyDescription}
				</strong>
				<p className={'desc'}>{repairProperty?.repairPropertyAddress}</p>
				<div className={'options'}>
					<div>
						<img src="/img/icons/bed.svg" alt="" />
						<span>{repairProperty?.repairPropertyType}</span>
					</div>
				</div>
				<Divider sx={{ mt: '15px', mb: '17px' }} />
				<div className={'bott'}>
					<div className="view-like-box">
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{repairProperty?.repairPropertyViews}</Typography>
						<IconButton color={'default'} onClick={() => likeRepairPropertyHandler(user, repairProperty?._id)}>
							{repairProperty?.meLiked?.[0]?.myFavorite ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteIcon />}
						</IconButton>
						<Typography className="view-cnt">{repairProperty?.repairPropertyLikes}</Typography>
					</div>
				</div>
			</Box>
		</>
	);

	return <Stack className="top-card-box">{Content}</Stack>;
};

export default TopRepairPropertyCard;
