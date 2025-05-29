import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography, Tooltip, Paper } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StarIcon from '@mui/icons-material/Star';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
}

// Custom Tooltip Component
const AgentTooltip = ({ agent }: { agent: any }) => {
	return (
		<Paper
			elevation={3}
			sx={{
				p: 2,
				minWidth: 280,
				maxWidth: 320,
				borderRadius: 2,
				background: 'rgba(45, 55, 72, 1)',
				color: 'white',
			}}
		>
			<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<Box
					component={'div'}
					sx={{
						width: 60,
						height: 60,
						borderRadius: '50%',
						backgroundImage: `url(${
							agent?.memberImage ? `${REACT_APP_API_URL}/${agent?.memberImage}` : '/img/profile/defaultUser.svg'
						})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						mr: 2,
						border: '3px solid rgba(255,255,255,0.3)',
					}}
				/>
				<Box component={'div'}>
					<Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
						{agent?.memberFullName ?? agent?.memberNick}
					</Typography>
					<Typography variant="body2" sx={{ opacity: 0.9 }}>
						Professional Agent
					</Typography>
				</Box>
			</Box>

			<Box component={'div'} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<HomeIcon sx={{ fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2">
						<strong>{agent?.memberProperties || 0}</strong> Properties
					</Typography>
				</Box>

				<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<ArticleIcon sx={{ fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2">
						<strong>{agent?.memberArticles || 0}</strong> Articles
					</Typography>
				</Box>

				<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<RemoveRedEyeIcon sx={{ fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2">
						<strong>{agent?.memberViews || 0}</strong> Profile Views
					</Typography>
				</Box>

				<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<FavoriteIcon sx={{ fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2">
						<strong>{agent?.memberLikes || 0}</strong> Likes
					</Typography>
				</Box>

				<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<PeopleIcon sx={{ fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2">
						<strong>{agent?.memberFollowers || 0}</strong> Followers
					</Typography>
				</Box>

				<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<PersonAddIcon sx={{ fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2">
						<strong>{agent?.memberFollowings || 0}</strong> Following
					</Typography>
				</Box>

				<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<StarIcon sx={{ fontSize: 18, opacity: 0.8 }} />
					<Typography variant="body2">
						<strong>{agent?.memberRating || 0}</strong> Rating
					</Typography>
				</Box>
			</Box>

			{agent?.memberDesc && (
				<Box component={'div'} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
					<Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
						{agent.memberDesc.length > 100 ? `${agent.memberDesc.substring(0, 100)}...` : agent.memberDesc}
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const handleAgentClick = () => {
		window.location.href = `/agent/detail?agentId=${agent?._id}`;
	};

	if (device === 'mobile') {
		return <div>AGENT CARD</div>;
	} else {
		return (
			<Tooltip
				title={<AgentTooltip agent={agent} />}
				arrow
				placement="right"
				enterDelay={300}
				leaveDelay={100}
				componentsProps={{
					tooltip: {
						sx: {
							bgcolor: 'transparent',
							maxWidth: 'none',
							p: 0,
						},
					},
					arrow: {
						sx: {
							color: 'rgba(45, 55, 72, 1)',
						},
					},
				}}
			>
				<Box
					component="div"
					className="agent-general-card"
					sx={{
						position: "relative",
						width: "300px",
						height: "360px",
						borderRadius: "16px",
						overflow: "hidden",
						cursor: "pointer",
						transition: "transform 0.3s ease, box-shadow 0.3s ease",
						"&:hover": {
							transform: "translateY(-5px)",
							boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)",
						},
					}}
					onClick={handleAgentClick}
				>
				{/* Main Image */}
				<Box
					component="img"
					src={imagePath}
					alt={agent?.memberNick}
					sx={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
						borderRadius: "16px",
					}}
				/>

				{/* Properties Badge */}
				<Box
					component="div"
					sx={{
						position: "absolute",
						top: "16px",
						left: "16px",
						backgroundColor: "rgba(45, 55, 72, 0.9)",
						color: "white",
						padding: "6px 12px",
						borderRadius: "20px",
						fontSize: "12px",
						fontWeight: "500",
					}}
				>
					{agent?.memberProperties} properties
				</Box>

				{/* Bottom Overlay Banner */}
				<Box
					component="div"
					sx={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						backgroundColor: "rgba(45, 55, 72, 0.9)",
						borderBottomLeftRadius: "16px",
						borderBottomRightRadius: "16px",
						padding: "20px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Box component="div">
						<Link
							href={{
								pathname: '/agent/detail',
								query: { agentId: agent?._id },
							}}
							style={{ textDecoration: 'none' }}
						>
							<Typography
								variant="h6"
								sx={{
									color: "white",
									fontWeight: "600",
									fontSize: "18px",
									lineHeight: 1.2,
									mb: 0.5,
									"&:hover": {
										color: "rgba(255, 255, 255, 0.8)",
									},
								}}
							>
								{agent?.memberFullName ?? agent?.memberNick}
							</Typography>
						</Link>
						<Typography
							variant="body2"
							sx={{
								color: "rgba(255, 255, 255, 0.8)",
								fontSize: "14px",
								lineHeight: 1.2,
							}}
						>
							Agent
						</Typography>
					</Box>

					<Stack direction="row" spacing={0.5} alignItems="center" sx={{ transform: "translateY(10px)" }}>
						{/* View Button */}
						<IconButton
							size="small"
							sx={{
								color: "white",
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								width: "32px",
								height: "32px",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.2)",
								},
							}}
						>
							<RemoveRedEyeIcon sx={{ fontSize: "16px" }} />
						</IconButton>
						<Typography 
							sx={{ 
								color: "white", 
								fontSize: "12px",
								minWidth: "20px",
								textAlign: "center"
							}}
						>
							{agent?.memberViews}
						</Typography>

						{/* Like Button */}
						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								likeMemberHandler(user, agent?._id);
							}}
							sx={{
								color: "white",
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								width: "32px",
								height: "32px",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.2)",
								},
							}}
						>
							{agent?.meLiked && agent?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon sx={{ fontSize: "16px", color: "#ff4757" }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: "16px" }} />
							)}
						</IconButton>
						<Typography 
							sx={{ 
								color: "white", 
								fontSize: "12px",
								minWidth: "20px",
								textAlign: "center"
							}}
						>
							{agent?.memberLikes}
						</Typography>
					</Stack>
				</Box>
			</Box>
			</Tooltip>
		);
	}
};

export default AgentCard;
