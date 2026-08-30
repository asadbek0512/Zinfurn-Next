import React, { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box, Link, Stack, Typography, IconButton } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import { getLocalizedArticleTitle } from '../../utils/localizeArticle';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
	const [overlayVisible, setOverlayVisible] = useState(false);
	const hideTimer = useRef<any>(null);

	const handleTouchStart = () => {
		if (hideTimer.current) clearTimeout(hideTimer.current);
		setOverlayVisible(true);
	};

	const handleTouchEnd = () => {
		hideTimer.current = setTimeout(() => setOverlayVisible(false), 900);
	};

	const imagePath = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/communityImg.png';
	const title = getLocalizedArticleTitle(boardArticle, i18n.language);

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
		return (
			<div
				className="mob-comm-card"
				onClick={(e) => chooseArticleHandler(e, boardArticle)}
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
				style={{ cursor: 'pointer', background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '100%' }}
			>
				<div className="mob-comm-img-box" style={{ position: 'relative', height: '130px', background: 'var(--tan)', backgroundImage: `url(${imagePath})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

					{/* Dark overlay */}
					<div className={`mob-comm-img-overlay${overlayVisible ? ' visible' : ''}`}></div>

					{/* Sana badge - Markazda */}
					<div style={{
						position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)',
						background: 'var(--primary)', color: '#fff', padding: '6px 15px',
						borderRadius: '10px 10px 0 0', border: '1.5px solid #fff',
						fontSize: '9px', fontWeight: 600, whiteSpace: 'nowrap', zIndex: 4
					}}>
						{formattedDate}
					</div>

					{/* Like & Views */}
					<div className={`mob-comm-stats-overlay${overlayVisible ? ' visible' : ''}`}>
						<div 
							onClick={(e) => {
								e.stopPropagation();
								likeArticleHandler(e, user, boardArticle?._id);
							}}
							style={{ position: 'absolute', bottom: '2px', left: '5px', display: 'flex', alignItems: 'center', gap: '3px', zIndex: 5 }}
						>
							{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon sx={{ fontSize: 16, color: 'var(--danger)' }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: 16, color: '#fff', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.6))' }} />
							)}
							<span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, textShadow: '0px 1px 2px rgba(0,0,0,0.6)' }}>{boardArticle?.articleLikes}</span>
						</div>

						<div style={{ position: 'absolute', bottom: '2px', right: '5px', display: 'flex', alignItems: 'center', gap: '3px', zIndex: 5 }}>
							<VisibilityIcon sx={{ fontSize: 16, color: '#fff', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.6))' }} />
							<span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, textShadow: '0px 1px 2px rgba(0,0,0,0.6)' }}>{boardArticle?.articleViews}</span>
						</div>
					</div>
				</div>
				
				<div style={{ padding: '12px 8px 6px' }}>
					<div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', height: '32px' }}>
						{title}
					</div>
					<div style={{ fontSize: '10px', color: 'var(--text-3)', lineHeight: 1.4, marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
						{t('Ideas, tips and stories from the Zinfurn community.')}
					</div>
					<div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>{t('Read More')}</div>
				</div>
			</div>
		);
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
					<Typography component="strong">{title}</Typography>
					<Typography component="span">{t('Ideas, tips and stories from the Zinfurn community.')}</Typography>
					<Typography className="read-more">{t('Read More')}</Typography>
				</Stack>
			</Box>
		</Stack>
	);
};

export default CommunityCard;
