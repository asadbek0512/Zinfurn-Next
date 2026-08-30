import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack, ClickAwayListener } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
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
import useDeviceDetect from '../hooks/useDeviceDetect';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
	replyTo?: {
		text: string;
		memberNick: string;
	};
	createdAt?: string;
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
	const mobFrameRef = useRef<HTMLDivElement>(null);
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
	const device = useDeviceDetect();

	// Format timestamp like Telegram (HH:mm or date)
	const formatMessageTime = (createdAt?: string) => {
		if (!createdAt) return '';
		const date = new Date(createdAt);
		if (isNaN(date.getTime())) return '';
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	};

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) return;

		const wsUrl = process.env.REACT_APP_API_WS ?? 'ws://localhost:3007';
		const token = getJwtToken();
		const ws = new WebSocket(`${wsUrl}?token=${token || ''}`);

		ws.onmessage = (msg: MessageEvent) => {
			try {
				const parsedData = JSON.parse(msg.data);

				switch (parsedData.event) {
					case 'info':
						setOnlineUsers(parsedData.totalClients);
						break;
					case 'getMessages':
						const list: MessagePayload[] = (parsedData.list ?? []).map((msg: any) => ({
							event: msg.event,
							text: msg.text,
							memberData: msg.memberData,
							replyTo: msg.replyTo ? { text: msg.replyTo.text, memberNick: msg.replyTo.memberNick } : undefined,
							createdAt: msg.createdAt ?? new Date().toISOString(),
						}));
						setMessagesList(list);
						const allIndices = new Set(list.map((_: any, idx: number) => idx));
						setReadMessages(allIndices);
						break;
					case 'message':
						if (parsedData.memberData?._id !== user._id) {
							setMessagesList((prev) => [
								...prev,
								{
									event: parsedData.event,
									text: parsedData.text,
									memberData: parsedData.memberData,
									replyTo: parsedData.replyTo
										? { text: parsedData.replyTo.text, memberNick: parsedData.replyTo.memberNick }
										: undefined,
									createdAt: parsedData.createdAt ?? new Date().toISOString(),
								},
							]);
						}
						break;
					default:
						break;
				}
			} catch (err) {
				console.error('WebSocket message parse error:', err);
			}
		};

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

				switch (parsedData.event) {
					case 'info':
						setOnlineUsers(parsedData.totalClients);
						break;
					case 'getMessages':
						const list: MessagePayload[] = (parsedData.list ?? []).map((msg: any) => ({
							event: msg.event,
							text: msg.text,
							memberData: msg.memberData,
							replyTo: msg.replyTo
								? {
										text: msg.replyTo.text,
										memberNick: msg.replyTo.memberNick,
								  }
								: undefined,
							createdAt: msg.createdAt ?? new Date().toISOString(),
						}));
						setMessagesList(list);
						const allIndices = new Set(list.map((_: any, idx: number) => idx));
						setReadMessages(allIndices);
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
		socket.send(JSON.stringify(messagePayload));

		// Add message optimistically to the list with replyTo data
		const optimisticMessage: MessagePayload = {
			event: 'message',
			text: messageInput.trim(),
			memberData: user as any,
			replyTo: replyTo
				? {
						text: replyTo.text,
						memberNick: replyTo.memberData?.memberNick ?? 'User',
				  }
				: undefined,
			createdAt: new Date().toISOString(), // ← SHU QATORNI QO'SHING
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

	useEffect(() => {
		const handler = () => setOpen((prev) => !prev);
		window.addEventListener('toggle-mob-chat', handler);
		return () => window.removeEventListener('toggle-mob-chat', handler);
	}, []);

	useEffect(() => {
		if (device !== 'mobile' || typeof window === 'undefined') return;
		const vv = window.visualViewport;
		if (!vv) return;
		const reposition = () => {
			const el = mobFrameRef.current;
			if (!el) return;
			const kbHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
			if (kbHeight > 50) {
				el.style.bottom = `${kbHeight + 12}px`;
				el.style.height = `${vv.height - 80}px`;
			} else {
				el.style.bottom = '';
				el.style.height = '';
			}
		};
		vv.addEventListener('resize', reposition);
		vv.addEventListener('scroll', reposition);
		return () => {
			vv.removeEventListener('resize', reposition);
			vv.removeEventListener('scroll', reposition);
		};
	}, [device]);

	if (device === 'mobile') {
		return (
			<Stack className="chatting mob-chatting">
				{open && <div className="mob-chat-backdrop" onClick={handleOpenChat} />}
				<Stack className={`chat-frame ${open ? 'open' : ''}`} style={{ zIndex: open ? 99999 : -1 }} ref={mobFrameRef as any}>
					<Box className={'chat-top'} component={'div'}>
						<img src="/img/logo/005.png" alt="Chat" style={{ width: 28, height: 28, marginRight: '10px', objectFit: 'contain' }} loading="lazy" decoding="async" />
						<div style={{ fontFamily: 'Nunito', color: '#fff', fontWeight: 800, fontSize: '18px' }}>Live Chat</div>
						<RippleBadge style={{ margin: '-18px 0 0 16px' }} badgeContent={onlineUsers} />
						<button onClick={handleOpenChat} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<CloseIcon style={{ fontSize: 18, color: '#fff' }} />
						</button>
					</Box>
					<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
						<ScrollableFeed>
							<Stack className={'chat-main'}>
								<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<div className={'welcome'}>Welcome to Live chat!</div>
								</Box>
								{messagesList.map((ele: MessagePayload, index: number) => {
									const { text, memberData, replyTo: messageReplyTo, createdAt } = ele;
									const messageTime = formatMessageTime(createdAt);
									const memberImage = memberData?.memberImage
										? memberData.memberImage.startsWith('http') ? memberData.memberImage : `${REACT_APP_API_URL}/${memberData.memberImage}`
										: '/img/profile/defaultUser.svg';
									const prevMsg = messagesList[index - 1];
									const nextMsg = messagesList[index + 1];
									const isPrevSameUser = prevMsg?.memberData?._id === memberData?._id;
									const isNextSameUser = nextMsg?.memberData?._id === memberData?._id;
									return memberData?._id === user?._id ? (
										<Box key={`msg-right-${index}`} component="div" flexDirection="row" style={{ display: 'flex', margin: '10px 0px' }} alignItems="flex-end" justifyContent="flex-end">
											<button onClick={() => handleSetReply(ele)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', opacity: 0.5 }}>
												<ReplyIcon style={{ fontSize: '14px', color: 'var(--text-4)' }} />
											</button>
											<div className="msg-right" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
												{messageReplyTo && (
													<div style={{ background: 'rgba(255,255,255,0.22)', borderLeft: '3px solid #fff', borderRadius: '6px', padding: '5px 8px', marginBottom: '4px' }}>
														<div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>↩ {messageReplyTo.memberNick}</div>
														<div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>{messageReplyTo.text.length > 40 ? messageReplyTo.text.substring(0, 40) + '...' : messageReplyTo.text}</div>
													</div>
												)}
												<div style={{ display: 'inline' }}>
													{text}
													<span style={{ float: 'right', marginLeft: '8px', marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.75)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
														{messageTime}
														{readMessages.has(index) ? <DoneAllIcon style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }} /> : <DoneIcon style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }} />}
													</span>
												</div>
											</div>
										</Box>
									) : (
										<Box key={`msg-left-${index}`} component="div" flexDirection="row" style={{ display: 'flex', margin: isPrevSameUser ? '2px 0' : '10px 0' }} alignItems="flex-end">
											{isNextSameUser ? <div style={{ width: '40px', minWidth: '40px' }} /> : <Avatar alt={memberData?.memberNick ?? 'User'} src={memberImage} />}
											<div className="msg-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
												{!isPrevSameUser && <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>{memberData?.memberNick ?? 'User'}</div>}
												{messageReplyTo && (
													<div style={{ background: 'rgba(207,100,34,0.12)', borderLeft: '3px solid var(--primary)', borderRadius: '6px', padding: '5px 8px', marginBottom: '4px' }}>
														<div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>↩ {messageReplyTo.memberNick}</div>
														<div style={{ fontSize: '12px', color: 'var(--primary-deep)' }}>{messageReplyTo.text.length > 40 ? messageReplyTo.text.substring(0, 40) + '...' : messageReplyTo.text}</div>
													</div>
												)}
												<div style={{ display: 'inline' }}>
													{text}
													{messageTime && <span style={{ float: 'right', marginLeft: '8px', marginTop: '4px', fontSize: '11px', color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center' }}>{messageTime}</span>}
												</div>
											</div>
											<button onClick={() => handleSetReply(ele)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', opacity: 0.5 }}>
												<ReplyIcon style={{ fontSize: '14px', color: 'var(--text-4)' }} />
											</button>
										</Box>
									);
								})}
							</Stack>
						</ScrollableFeed>
					</Box>
					<Box className={'chat-bott'} component={'div'} style={{ position: 'relative', display: 'flex', alignItems: 'center', paddingRight: '8px' }}>
						{replyTo && (
							<div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: 'var(--surface)', borderLeft: '4px solid var(--primary)', borderRadius: '8px 8px 0 0', padding: '10px 12px', margin: '0 8px', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<div style={{ flex: 1, overflow: 'hidden' }}>
										<div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>Replying to {replyTo.memberData?.memberNick ?? 'User'}</div>
										<div style={{ fontSize: '13px', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{replyTo.text}</div>
									</div>
									<CloseIcon onClick={handleCancelReply} style={{ cursor: 'pointer', color: 'var(--text-4)', fontSize: '20px' }} />
								</div>
							</div>
						)}
						<input type={'text'} name={'message'} className={'msg-input'} placeholder={replyTo ? 'Reply...' : 'Type message'} value={messageInput} onChange={getInputMessageHandler} onKeyDown={getKeyHandler} style={{ flex: 1 }} />
						<button className={'send-msg-btn'} onClick={onClickHandler} style={{ minWidth: '42px', minHeight: '42px', marginLeft: '6px' }}>
							<SendIcon style={{ color: '#fff' }} />
						</button>
					</Box>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="chatting">
			{openButton ? (
				<>
					{!open && (
						<button
							className="chat-button"
							onClick={handleOpenChat}
							style={{ bottom: '168px', right: '30px', zIndex: 1300 }}
						>
							<img src="/img/banner/001..png" alt="Chat" style={{ width: '33px', height: '28px' }} loading="lazy" decoding="async" />
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
								background: 'var(--surface)',
								border: 'none',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0px 0px 10px 0px rgba(50,50,50,0.3)',
								zIndex: 99999,
							}}
						>
							<CloseFullscreenIcon style={{ color: 'var(--text-1)' }} />
						</button>
					)}
				</>
			) : null}

			<Stack className={`chat-frame ${open ? 'open' : ''}`} style={{ zIndex: open ? 99998 : 100 }}>
				<Box className={'chat-top'} component={'div'}>
					<img src="/img/logo/005.png" alt="Chat" style={{ width: 28, height: 28, marginRight: '10px', objectFit: 'contain' }} loading="lazy" decoding="async" />
					<div style={{ fontFamily: 'Nunito', color: '#fff', fontWeight: 800, fontSize: '18px' }}>Live Chat</div>
					<RippleBadge style={{ margin: '-18px 0 0 16px' }} badgeContent={onlineUsers} />
				</Box>

				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>

							{messagesList.map((ele: MessagePayload, index: number) => {
								const { text, memberData, replyTo: messageReplyTo, createdAt } = ele;
								const messageTime = formatMessageTime(createdAt);
								const memberImage = memberData?.memberImage
									? memberData.memberImage.startsWith('http')
										? memberData.memberImage
										: `${REACT_APP_API_URL}/${memberData.memberImage}`
									: '/img/profile/defaultUser.svg';
								
								// Check for message grouping (same user consecutive messages)
								const prevMsg = messagesList[index - 1];
								const nextMsg = messagesList[index + 1];
								const isPrevSameUser = prevMsg?.memberData?._id === memberData?._id;
								const isNextSameUser = nextMsg?.memberData?._id === memberData?._id;

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
											<ReplyIcon style={{ fontSize: '14px', color: 'var(--text-3)' }} />
										</button>

										<div className="msg-right" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
											{messageReplyTo && (
												<div
													style={{
														background: 'rgba(255,255,255,0.22)',
														borderLeft: '3px solid #fff',
														borderRadius: '6px',
														padding: '5px 8px',
														marginBottom: '4px',
													}}
												>
													<div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
														↩ {messageReplyTo.memberNick}
													</div>
													<div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
														{messageReplyTo.text.length > 40
															? messageReplyTo.text.substring(0, 40) + '...'
															: messageReplyTo.text}
													</div>
												</div>
											)}
											<div style={{ display: 'inline' }}>
												{text}
												<span style={{
													float: 'right',
													marginLeft: '8px',
													marginTop: '4px',
													fontSize: '11px',
													color: 'rgba(255,255,255,0.75)',
													display: 'inline-flex',
													alignItems: 'center',
													gap: '2px'
												}}>
													{messageTime}
													{readMessages.has(index) ? (
														<DoneAllIcon style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }} />
													) : (
														<DoneIcon style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }} />
													)}
												</span>
											</div>
										</div>
									</Box>
								) : (
									<Box
										key={`msg-left-${index}`}
										component="div"
										flexDirection="row"
										style={{ display: 'flex', margin: isPrevSameUser ? '2px 0' : '10px 0' }}
										alignItems="flex-end"
									>
										{/* Avatar — show only on LAST message of group */}
										{isNextSameUser
											? <div style={{ width: '40px', minWidth: '40px' }} />
											: <Avatar alt={memberData?.memberNick ?? 'User'} src={memberImage} />
										}

										<div className="msg-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
											{/* Nickname — show only on FIRST message of group */}
											{!isPrevSameUser && (
												<div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
													{memberData?.memberNick ?? 'User'}
												</div>
											)}
											{messageReplyTo && (
												<div
													style={{
														background: 'rgba(207,100,34,0.12)',
														borderLeft: '3px solid var(--primary)',
														borderRadius: '6px',
														padding: '5px 8px',
														marginBottom: '4px',
													}}
												>
													<div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>
														↩ {messageReplyTo.memberNick}
													</div>
													<div style={{ fontSize: '12px', color: 'var(--primary-deep)' }}>
														{messageReplyTo.text.length > 40
															? messageReplyTo.text.substring(0, 40) + '...'
															: messageReplyTo.text}
													</div>
												</div>
											)}
											<div style={{ display: 'inline' }}>
												{text}
												{messageTime && (
													<span style={{
														float: 'right',
														marginLeft: '8px',
														marginTop: '4px',
														fontSize: '11px',
														color: 'var(--text-3)',
														display: 'inline-flex',
														alignItems: 'center',
														gap: '2px'
													}}>
														{messageTime}
													</span>
												)}
											</div>
										</div>

										<button
											onClick={() => handleSetReply(ele)}
											style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', opacity: 0.5 }}
										>
											<ReplyIcon style={{ fontSize: '14px', color: 'var(--text-3)' }} />
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
								background: 'var(--bg-muted)',
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
											color: 'var(--text-2)',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										{replyTo.text}
									</div>
								</div>
								<CloseIcon onClick={handleCancelReply} style={{ cursor: 'pointer', color: 'var(--text-3)', fontSize: '20px' }} />
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
						<SentimentSatisfiedOutlinedIcon style={{ fontSize: '26px', color: 'var(--text-2)' }} />
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
