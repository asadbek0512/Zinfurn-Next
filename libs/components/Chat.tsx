import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';
import { getJwtToken } from '../../libs/auth';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member | null;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	// Initialize WebSocket connection
	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			console.log('✅ WebSocket already connected');
			return;
		}

		const wsUrl = process.env.REACT_APP_API_WS ?? 'ws://localhost:3007';
		const token = getJwtToken();
		const ws = new WebSocket(`${wsUrl}?token=${token || ''}`);

		ws.onopen = () => {
			console.log('✅ WebSocket connection established!');
			socketVar(ws);
		};

		ws.onerror = (error) => {
			console.error('❌ WebSocket error:', error);
		};

		return () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close();
			}
		};
	}, []);

	useEffect(() => {
		if (!socket) return;

		const handleMessage = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data);
				console.log('📨 Received:', data);

				switch (data.event) {
					case 'info':
						const newInfo: InfoPayload = data;
						setOnlineUsers(newInfo.totalClients);
						break;
					case 'getMessages':
						const list: MessagePayload[] = data.list ?? [];
						setMessagesList(list);
						break;
					case 'message':
						const newMessage: MessagePayload = data;
						setMessagesList((prev) => [...prev, newMessage]);
						break;
					default:
						break;
				}
			} catch (err) {
				console.error('WebSocket message parse error:', err);
			}
		};

		socket.onmessage = handleMessage;
		return () => {
			socket.onmessage = null;
		};
	}, [socket]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value;
		setMessageInput(text);
	}, []);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		try {
			if (e.key === 'Enter') {
				onClickHandler();
			}
		} catch (err: any) {
			console.error('Key handler error:', err);
		}
	};

	const onClickHandler = () => {
		if (!messageInput.trim()) {
			sweetErrorAlert(Messages.error4);
			return;
		}
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			console.error('❌ Socket not connected:', socket?.readyState);
			sweetErrorAlert('Connection error. Please refresh the page.');
			return;
		}
		const message = JSON.stringify({ event: 'message', data: messageInput.trim() });
		console.log('📤 Sending message:', message);
		socket.send(message);
		setMessageInput('');
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<>
					{/* Ochish buttoni — faqat chat yopiq bo'lganda */}
					{!open && (
						<button
							className="chat-button"
							onClick={handleOpenChat}
							style={{
								bottom: '155px',
								right: '30px',
								zIndex: 100,
							}}
						>
							<img src="/img/banner/001..png" alt="Chat" style={{ width: '33px', height: '28px' }} />
						</button>
					)}

					{/* Yopish buttoni — faqat chat ochiq bo'lganda, hamma narsa ustida */}
					{open && (
						<button
							onClick={handleOpenChat}
							style={{
								position: 'fixed',
								bottom: '100px', // 👈 pastda
								right: '30px',
								width: '50px',
								height: '50px',
								borderRadius: '50%',
								background: '#fff', // real chat rangi
								border: 'none',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0px 0px 10px 0px rgba(50,50,50,0.3)',
								zIndex: 99999, // 👈 hamma narsa ustida
							}}
						>
							<CloseFullscreenIcon style={{ color: '#333' }} />
						</button>
					)}
				</>
			) : null}

			{/* Chat frame — ochilganda hamma narsa ustida */}
			<Stack
				className={`chat-frame ${open ? 'open' : ''}`}
				style={{ zIndex: open ? 99998 : 100 }} // 👈 ochilganda ustida
			>
				<Box className={'chat-top'} component={'div'}>
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} />
				</Box>

				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>

							{messagesList.map((ele: MessagePayload, index: number) => {
								const { text, memberData } = ele;
								const memberImage = memberData?.memberImage
									? memberData.memberImage.startsWith('http')
										? memberData.memberImage
										: `${REACT_APP_API_URL}/${memberData.memberImage}`
									: '/img/profile/defaultUser.svg';
								return memberData?._id === user?._id ? (
									<Box
										key={`msg-right-${index}`}
										component="div"
										flexDirection="row"
										style={{ display: 'flex' }}
										alignItems="flex-end"
										justifyContent="flex-end"
										sx={{ m: '10px 0px' }}
									>
										<div className="msg-right">{text}</div>
									</Box>
								) : (
									<Box
										key={`msg-left-${index}`}
										flexDirection="row"
										style={{ display: 'flex' }}
										sx={{ m: '10px 0px' }}
										component="div"
									>
										<Avatar alt={memberData?.memberNick ?? 'User'} src={memberImage} />
										<div className="msg-left">{text}</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>

				<Box className={'chat-bott'} component={'div'}>
					<input
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
