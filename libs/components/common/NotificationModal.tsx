import React, { useEffect, useState } from 'react';
import { Stack, Typography, IconButton, Menu, MenuItem, Divider, Avatar, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../../apollo/store';
import { useSwipeable } from 'react-swipeable';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useTranslation } from 'next-i18next';

interface Notification {
	id: string;
	title: string;
	desc?: string;
	type: string;
	status: string;
	createdAt: Date;
}

const NotificationItem = ({ notification, onRead }: { notification: Notification; onRead: () => void }) => {
	const { t } = useTranslation('common');
	const handlers = useSwipeable({
		onSwipedRight: () => {
			if (notification.status === 'WAIT') {
				onRead();
			}
		},
		trackMouse: true,
	});

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'LIKE':
				return <FavoriteIcon sx={{ color: '#ff4d4f' }} />;
			case 'COMMENT':
				return <ChatBubbleIcon sx={{ color: '#40a9ff' }} />;
			default:
				return <NotificationsIcon sx={{ color: '#cf6422' }} />;
		}
	};

	return (
		<div {...handlers}>
			<MenuItem
				style={{ position: 'relative', display: 'block', whiteSpace: 'normal' }}
				sx={{
					py: 2,
					px: 3,
					borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
					backgroundColor: notification.status === 'WAIT' ? 'rgba(207, 100, 34, 0.04)' : 'transparent',
					'&:hover': { backgroundColor: 'rgba(207, 100, 34, 0.08)' },
					transition: 'all 0.2s ease',
				}}
			>
				<Stack direction="row" spacing={2} alignItems="flex-start">
					<Avatar
						style={{ width: 40, height: 40 }}
						sx={{ bgcolor: notification.status === 'WAIT' ? 'rgba(207, 100, 34, 0.1)' : 'rgba(0,0,0,0.05)' }}
					>
						{getNotificationIcon(notification.type)}
					</Avatar>
					<Stack sx={{ flex: 1 }} spacing={0.5}>
						<Typography variant="body2" sx={{ fontWeight: 600, color: '#181a20', lineHeight: 1.3 }}>
							{notification.title}
						</Typography>
						{notification.desc && (
							<Typography variant="caption" sx={{ color: '#666', lineHeight: 1.4 }}>
								{notification.desc}
							</Typography>
						)}
						<Typography variant="caption" sx={{ color: '#999', mt: 0.5, fontSize: '10px' }}>
							{format(new Date(notification.createdAt), t('MMM dd, yyyy HH:mm'))}
						</Typography>
					</Stack>
					{notification.status === 'WAIT' && (
						<div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cf6422', marginTop: 8, flexShrink: 0 }} />
					)}
				</Stack>
			</MenuItem>
		</div>
	);
};

const NotificationModal = ({
	anchorEl,
	open,
	onClose,
	onUnreadCountChange,
}: {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	onUnreadCountChange?: (count: number) => void;
}) => {
	const { t } = useTranslation('common');
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const socket = useReactiveVar(socketVar);
	const user = useReactiveVar(userVar);

	useEffect(() => {
		onUnreadCountChange?.(unreadCount);
	}, [unreadCount, onUnreadCountChange]);

	useEffect(() => {
		if (open && user?._id) {
			if (socket?.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({ event: 'get_notifications' }));
			}
		}
	}, [open, user?._id]);

	useEffect(() => {
		if (open && notifications.length > 0 && socket?.readyState === WebSocket.OPEN) {
			const unreadNotificationIds = notifications.filter((n) => n.status === 'WAIT').map((n) => n.id);
			if (unreadNotificationIds.length > 0) {
				socket.send(JSON.stringify({ event: 'markNotificationsAsRead', data: unreadNotificationIds }));
			}
		}
	}, [open, notifications]);

	useEffect(() => {
		if (!socket || !user?._id) return;

		const handleMessage = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data);
				if (data.event === 'notification') {
					const notification = data.payload;
					setNotifications((prev) => {
						const isDuplicate = prev.some((n) => n.id === notification.id);
						if (isDuplicate) return prev;
						const newNotifications = [notification, ...prev];
						setUnreadCount(newNotifications.filter((n) => n.status === 'WAIT').length);
						return newNotifications;
					});
				} else if (data.event === 'notifications_list') {
					setNotifications(data.data);
					setUnreadCount(data.data.length);
				} else if (data.event === 'notificationStatus') {
					const { id, status } = data.payload;
					setNotifications((prev) => {
						const updatedNotifications = prev.map((n) => (n.id === id ? { ...n, status } : n));
						setUnreadCount(updatedNotifications.filter((n) => n.status === 'WAIT').length);
						return updatedNotifications;
					});
				}
			} catch (error) {
				console.error('Error processing notification:', error);
			}
		};

		socket.addEventListener('message', handleMessage);

		return () => {
			socket.removeEventListener('message', handleMessage);
		};
	}, [socket, user]);

	return (
		<Menu
			anchorEl={anchorEl}
			open={open}
			onClose={onClose}
			disableScrollLock
			PaperProps={{
				style: {
					width: '360px',
					maxHeight: '480px',
					borderRadius: '16px',
					marginTop: '12px',
					overflow: 'hidden',
					boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.12)',
					border: '1px solid rgba(0,0,0,0.05)',
				},
				sx: { '& .MuiList-root': { padding: 0 } },
			}}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		>
			<div style={{ padding: '16px 20px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 700, color: '#181a20' }}>
						{t('Notifications')}
					</Typography>
					{unreadCount > 0 && (
						<span style={{ background: '#cf6422', color: '#fff', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
							{unreadCount}
						</span>
					)}
				</Stack>
				{unreadCount > 0 && (
					<Tooltip title={t('Mark all as read')}>
						<IconButton size="small" sx={{ color: '#cf6422' }}>
							<MarkEmailReadIcon sx={{ fontSize: '20px' }} />
						</IconButton>
					</Tooltip>
				)}
			</div>

			<div style={{ maxHeight: '400px', overflow: 'auto', background: '#fafafa' }}>
				{notifications.length === 0 ? (
					<div style={{ padding: '48px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
						<div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							<NotificationsNoneIcon sx={{ fontSize: '30px', color: '#ccc' }} />
						</div>
						<Typography sx={{ color: '#999', fontSize: '14px', fontWeight: 500 }}>
							{t('No notifications yet')}
						</Typography>
					</div>
				) : (
					notifications.map((notification) => (
						<NotificationItem key={notification.id} notification={notification} onRead={() => {}} />
					))
				)}
			</div>

			<Divider />
			<div style={{ padding: '12px', textAlign: 'center' }}>
				<Typography
					variant="caption"
					sx={{ color: '#cf6422', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
					onClick={onClose}
				>
					{t('Close')}
				</Typography>
			</div>
		</Menu>
	);
};

export default NotificationModal;
