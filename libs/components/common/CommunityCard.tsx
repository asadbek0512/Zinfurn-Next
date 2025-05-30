import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box, Link, Stack, Typography, IconButton } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler: any;
}

const CommunityCard = ({ boardArticle, size = 'normal', likeArticleHandler }: CommunityCardProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const imagePath = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/communityImg.png';

	const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	}

	return (
		<Stack onClick={(e) => chooseArticleHandler(e, boardArticle)}>
			<Box component="div" className="vertical-card">
				<Box component="div" className="community-img" sx={{ backgroundImage: `url(${imagePath})` }}>
					<Box component="div" className="date-badge">
						<Moment format="DD MMM YYYY">{boardArticle?.createdAt}</Moment>
					</Box>

					<Stack direction="row" spacing={1} className="hover-actions">
						<Stack direction="row" spacing={0.5} alignItems="center" className="action-item">
							<IconButton className="action-btn" onClick={(e: any) => likeArticleHandler(e, user, boardArticle?._id)}>
								{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon className="liked-icon" />
								) : (
									<FavoriteBorderIcon className="like-icon" />
								)}
							</IconButton>
							<Typography className="action-count">{boardArticle?.articleLikes}</Typography>
						</Stack>

						<Stack direction="row" spacing={0.5} alignItems="center" className="action-item">
							<IconButton className="action-btn">
								<RemoveRedEyeIcon className="view-icon" />
							</IconButton>
							<Typography className="action-count">{boardArticle?.articleViews}</Typography>
						</Stack>
					</Stack>
				</Box>

				<Stack className="card-content" spacing={0.5}>
					<Typography component="strong">{boardArticle?.articleTitle}</Typography>
					<Typography component="span">Lorem ipsum dolor sit amet, consectetur adipiscing elit</Typography>
					<Typography className="read-more">Read More</Typography>
				</Stack>
			</Box>
		</Stack>
	);
};

export default CommunityCard;