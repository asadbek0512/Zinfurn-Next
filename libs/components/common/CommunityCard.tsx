import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box, Link, Stack, Typography, IconButton } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'next-i18next';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler: any;
}

const CommunityCard = ({ boardArticle, likeArticleHandler }: CommunityCardProps) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');

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

	const formatDate = (date: string | Date, locale: string) => {
		const months: { [key: string]: string[] } = {
			en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
			kr: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			ar: [
				'يناير',
				'فبراير',
				'مارس',
				'أبريل',
				'مايو',
				'يونيو',
				'يوليو',
				'أغسطس',
				'سبتمبر',
				'أكتوبر',
				'نوفمبر',
				'ديسمبر',
			],
			uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
		};

		if (!date) return 'No date';

		const d = new Date(date);
		const day = d.getDate().toString().padStart(2, '0');
		const monthIndex = d.getMonth();

		// locale ning faqat bosh qismini olish
		const lang = locale.split('-')[0]; // 'ko-KR' → 'ko'
		const currentLocale = lang in months ? lang : 'en';

		const month = months[currentLocale][monthIndex];
		const year = d.getFullYear();

		return `${day} ${month} ${year}`;
	};

	const formattedDate = useMemo(() => {
		return formatDate(boardArticle?.createdAt, i18n.language);
	}, [boardArticle?.createdAt, i18n.language]);

	if (device === 'mobile') {
		return <div>{t('COMMUNITY CARD MOBILE')}</div>;
	}

	return (
		<Stack onClick={(e) => chooseArticleHandler(e, boardArticle)}>
			<Box component="div" className="vertical-card">
				<Box component="div" className="community-img" sx={{ backgroundImage: `url(${imagePath})` }}>
					<Box component="div" className="date-badge">
						<span style={{ color: 'white', fontSize: '14px' }}>{formattedDate}</span>
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
					<Typography component="span">{t('Lorem ipsum dolor sit amet, consectetur adipiscing elit')}</Typography>
					<Typography className="read-more">{t('Read More')}</Typography>
				</Stack>
			</Box>
		</Stack>
	);
};

export default CommunityCard;
