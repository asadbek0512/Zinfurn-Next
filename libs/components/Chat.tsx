import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack, ClickAwayListener } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';
import { getJwtToken } from '../../libs/auth';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
	replyTo?: {
		text: string;
		memberNick: string;
	};
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member | null;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const emojiPickerRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [readMessages, setReadMessages] = useState<Set<number>>(new Set());
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [replyTo, setReplyTo] = useState<MessagePayload | null>(null);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) return;

		const wsUrl = process.env.REACT_APP_API_WS ?? 'ws://localhost:3007';
		const token = getJwtToken();
		const ws = new WebSocket(`${wsUrl}?token=${token || ''}`);

		ws.onopen = () => {
			socketVar(ws);
		};
		ws.onerror = (error) => {
			console.error('❌ WebSocket error:', error);
		};

		return () => {
			if (ws.readyState === WebSocket.OPEN) ws.close();
		};
	}, []);

	useEffect(() => {
		if (!socket) return;

		const handleMessage = (msg: MessageEvent) => {
			try {
				const parsedData = JSON.parse(msg.data);
				console.log('📨 MESSAGE RECEIVED:', JSON.stringify(parsedData));

				switch (parsedData.event) {
					case 'info':
						setOnlineUsers(parsedData.totalClients);
						break;
					case 'getMessages':
						const list: MessagePayload[] = parsedData.list ?? [];
						setMessagesList(list);
						const allIndices = new Set(list.map((_: any, idx: number) => idx));
						setReadMessages(allIndices);
						break;
					case 'message':
						console.log('💬 NEW MESSAGE replyTo:', parsedData.replyTo);
						// Check if this message is already added (optimistic update)
						setMessagesList((prev) => {
							// Check if message with same text and member already exists (to avoid duplicates)
							const isDuplicate = prev.some(
								(m) => m.text === parsedData.text && m.memberData?._id === parsedData.memberData?._id
							);
							if (isDuplicate) {
								console.log('⚠️ Duplicate message, skipping');
								return prev;
							}
							return [...prev, parsedData];
						});
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
		const timeoutId = setTimeout(() => setOpenButton(true), 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	const handleOpenChat = () => setOpen((prev) => !prev);

	const getInputMessageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageInput(e.target.value);
	}, []);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') onClickHandler();
	};

	const handleSetReply = (message: MessagePayload) => {
		console.log('🔁 Setting reply to:', message);
		setReplyTo(message);
	};

	const handleCancelReply = () => setReplyTo(null);

	const onClickHandler = () => {
		if (!messageInput.trim()) {
			sweetErrorAlert(Messages.error4);
			return;
		}
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			sweetErrorAlert('Connection error. Please refresh the page.');
			return;
		}

		const messagePayload: any = { event: 'message', data: messageInput.trim() };
		if (replyTo) {
			messagePayload.replyTo = {
				text: replyTo.text,
				memberNick: replyTo.memberData?.memberNick ?? 'User',
			};
		}

		console.log('📤 SENDING:', JSON.stringify(messagePayload));
		socket.send(JSON.stringify(messagePayload));

		// Add message optimistically to the list with replyTo data
		const optimisticMessage: MessagePayload = {
			event: 'message',
			text: messageInput.trim(),
			memberData: user as any,
			replyTo: replyTo ? {
				text: replyTo.text,
				memberNick: replyTo.memberData?.memberNick ?? 'User',
			} : undefined,
		};
		
		setMessagesList((prev) => [...prev, optimisticMessage]);

		const newMessageIndex = messagesList.length;
		setTimeout(() => {
			setReadMessages((prev) => {
				const newSet = new Set(prev);
				newSet.add(newMessageIndex);
				return newSet;
			});
		}, 5000);

		setMessageInput('');
		setShowEmojiPicker(false);
		setReplyTo(null);
	};

	const handleEmojiSelect = (emoji: any) => {
		setMessageInput((prev) => prev + emoji.native);
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<>
					{!open && (
						<button
							className="chat-button"
							onClick={handleOpenChat}
							style={{ bottom: '155px', right: '30px', zIndex: 100 }}
						>
							<img src="/img/banner/001..png" alt="Chat" style={{ width: '33px', height: '28px' }} />
						</button>
					)}
					{open && (
						<button
							onClick={handleOpenChat}
							style={{
								position: 'fixed',
								bottom: '100px',
								right: '30px',
								width: '50px',
								height: '50px',
								borderRadius: '50%',
								background: '#fff',
								border: 'none',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0px 0px 10px 0px rgba(50,50,50,0.3)',
								zIndex: 99999,
							}}
						>
							<CloseFullscreenIcon style={{ color: '#333' }} />
						</button>
					)}
				</>
			) : null}

			<Stack className={`chat-frame ${open ? 'open' : ''}`} style={{ zIndex: open ? 99998 : 100 }}>
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
								const { text, memberData, replyTo: messageReplyTo } = ele;
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
										style={{ display: 'flex', margin: '10px 0px' }}
										alignItems="flex-end"
										justifyContent="flex-end"
									>
										<button
											onClick={() => handleSetReply(ele)}
											style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', opacity: 0.5 }}
										>
											<ReplyIcon style={{ fontSize: '14px', color: '#999' }} />
										</button>

										<div className="msg-right" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
											{messageReplyTo && (
												<div
													style={{
														background: 'rgba(0,136,204,0.15)',
														borderLeft: '3px solid #0088cc',
														borderRadius: '6px',
														padding: '5px 8px',
														marginBottom: '4px',
													}}
												>
													<div style={{ fontSize: '11px', fontWeight: 700, color: '#1976D2', marginBottom: '2px' }}>
														↩ {messageReplyTo.memberNick}
													</div>
													<div style={{ fontSize: '12px', color: '#1976D2' }}>
														{messageReplyTo.text.length > 40
															? messageReplyTo.text.substring(0, 40) + '...'
															: messageReplyTo.text}
													</div>
												</div>
											)}
											<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
												{text}
												{readMessages.has(index) ? (
													<DoneAllIcon style={{ fontSize: '16px', color: '#64B5F6', transition: 'color 0.5s ease' }} />
												) : (
													<DoneIcon style={{ fontSize: '16px', color: '#2196F3', transition: 'color 0.5s ease' }} />
												)}
											</div>
										</div>
									</Box>
								) : (
									<Box
										key={`msg-left-${index}`}
										component="div"
										flexDirection="row"
										style={{ display: 'flex', margin: '10px 0px' }}
									>
										<Avatar alt={memberData?.memberNick ?? 'User'} src={memberImage} />

										<div className="msg-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
											{messageReplyTo && (
												<div
													style={{
														background: 'rgba(0,0,0,0.08)',
														borderLeft: '3px solid #5aad7f',
														borderRadius: '6px',
														padding: '5px 8px',
														marginBottom: '4px',
													}}
												>
													<div style={{ fontSize: '11px', fontWeight: 700, color: '#5aad7f', marginBottom: '2px' }}>
														↩ {messageReplyTo.memberNick}
													</div>
													<div style={{ fontSize: '12px', color: '#444' }}>
														{messageReplyTo.text.length > 40
															? messageReplyTo.text.substring(0, 40) + '...'
															: messageReplyTo.text}
													</div>
												</div>
											)}
											<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
												{text}
												<DoneAllIcon style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }} />
											</div>
										</div>

										<button
											onClick={() => handleSetReply(ele)}
											style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', opacity: 0.5 }}
										>
											<ReplyIcon style={{ fontSize: '14px', color: '#999' }} />
										</button>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>

				<Box
					className={'chat-bott'}
					component={'div'}
					style={{ position: 'relative', display: 'flex', alignItems: 'center', paddingRight: '8px' }}
				>
					{showEmojiPicker && (
						<ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
							<div
								ref={emojiPickerRef}
								style={{
									position: 'absolute',
									bottom: '55px',
									right: '45px',
									zIndex: 1000,
									boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
									borderRadius: '8px',
								}}
							>
								<Picker
									data={data}
									onEmojiSelect={handleEmojiSelect}
									theme="light"
									locale="en"
									set="native"
									showPreview={false}
									showSkinTones={false}
									emojiSize={20}
									maxFrequentRows={2}
									navPosition="top"
									searchPosition="sticky"
								/>
							</div>
						</ClickAwayListener>
					)}

					{replyTo && (
						<div
							style={{
								position: 'absolute',
								bottom: '100%',
								left: 0,
								right: 0,
								background: '#f5f5f5',
								borderLeft: '4px solid #0088cc',
								borderRadius: '8px 8px 0 0',
								padding: '10px 12px',
								margin: '0 8px',
								boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<div style={{ flex: 1, overflow: 'hidden' }}>
									<div style={{ fontSize: '12px', color: '#0088cc', fontWeight: 600, marginBottom: '4px' }}>
										Replying to {replyTo.memberData?.memberNick ?? 'User'}
									</div>
									<div
										style={{
											fontSize: '13px',
											color: '#666',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										{replyTo.text}
									</div>
								</div>
								<CloseIcon onClick={handleCancelReply} style={{ cursor: 'pointer', color: '#999', fontSize: '20px' }} />
							</div>
						</div>
					)}

					<input
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={replyTo ? 'Reply...' : 'Type message'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
						style={{ flex: 1 }}
					/>
					<button
						onClick={() => setShowEmojiPicker((prev) => !prev)}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: '8px',
							display: 'flex',
							alignItems: 'center',
							minWidth: '36px',
							minHeight: '36px',
						}}
					>
						<SentimentSatisfiedOutlinedIcon style={{ fontSize: '26px', color: '#666' }} />
					</button>
					<button
						className={'send-msg-btn'}
						onClick={onClickHandler}
						style={{ minWidth: '42px', minHeight: '42px', marginLeft: '2px' }}
					>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
