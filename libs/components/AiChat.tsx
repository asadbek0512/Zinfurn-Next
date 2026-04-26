import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Box, CircularProgress, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from '@mui/icons-material/Close';
import ScrollableFeed from 'react-scrollable-feed';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../hooks/useDeviceDetect';

interface AiMessage {
	role: 'user' | 'assistant';
	content: string;
}

const AiChat = () => {
	const [messages, setMessages] = useState<AiMessage[]>([]);
	const [input, setInput] = useState('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

	useEffect(() => {
		if (!router.isReady) return;
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, [router.isReady]);

	useEffect(() => {
		setOpenButton(false);
		if (!router.isReady) return;
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 800);
		return () => clearTimeout(timeoutId);
	}, [router.pathname, router.isReady]);

	const handleToggle = () => {
		setOpen((prev) => !prev);
	};

	useEffect(() => {
		const handler = () => setOpen((prev) => !prev);
		window.addEventListener('toggle-mob-ai', handler);
		return () => window.removeEventListener('toggle-mob-ai', handler);
	}, []);

	const getInputHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	}, []);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	};

	const sendMessage = async () => {
		const text = input.trim();
		if (!text || loading) return;

		const userMessage: AiMessage = { role: 'user', content: text };
		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);
		setInput('');
		setLoading(true);

		try {
			const response = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: updatedMessages,
					locale: router.locale || 'en',
				}),
			});

			const data = await response.json();
			const aiMessage: AiMessage = { role: 'assistant', content: data.reply };
			setMessages((prev) => [...prev, aiMessage]);
		} catch (err) {
			const errMessage: AiMessage = {
				role: 'assistant',
				content: t('AI error message'),
			};
			setMessages((prev) => [...prev, errMessage]);
		} finally {
			setLoading(false);
		}
	};

	const aiMessages = (
		<>
			<Box className="ai-chat-top" component="div">
				<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32, marginRight: '8px' }} />
				<span>{t('Zinfurn AI Assistant')}</span>
			</Box>
			<Box className="ai-chat-content" component="div">
				<ScrollableFeed>
					<Stack className="ai-chat-main">
						<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
							<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
								<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32 }} />
							</Avatar>
							<div className="ai-msg-left">{t('AI Welcome Message')}</div>
						</Box>
						{messages.map((msg, idx) =>
							msg.role === 'user' ? (
								<Box key={idx} component="div" flexDirection="row" style={{ display: 'flex' }} alignItems="flex-end" justifyContent="flex-end" sx={{ m: '10px 0px' }}>
									<div className="ai-msg-right">{msg.content}</div>
								</Box>
							) : (
								<Box key={idx} flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
									<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
										<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
									</Avatar>
									<div className="ai-msg-left">{msg.content}</div>
								</Box>
							),
						)}
						{loading && (
							<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
								<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
									<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
								</Avatar>
								<div className="ai-msg-left ai-typing"><span></span><span></span><span></span></div>
							</Box>
						)}
					</Stack>
				</ScrollableFeed>
			</Box>
			<Box className="ai-chat-bott" component="div">
				<input type="text" className="ai-msg-input" placeholder={t('AI Input Placeholder')} value={input} onChange={getInputHandler} onKeyDown={getKeyHandler} disabled={loading} />
				<button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
					{loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : <SendIcon style={{ color: '#fff' }} />}
				</button>
			</Box>
		</>
	);

	if (device === 'mobile') {
		return (
			<Stack className="ai-chatting mob-ai-chatting">
				{open && <div className="mob-chat-backdrop" onClick={handleToggle} />}
				<Stack className={`ai-chat-frame ${open ? 'open' : ''}`}>
					<Box className="ai-chat-top" component="div">
						<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32, marginRight: '8px' }} />
						<span>{t('Zinfurn AI Assistant')}</span>
						<button onClick={handleToggle} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
							<CloseIcon style={{ fontSize: 20, color: '#666' }} />
						</button>
					</Box>
					<Box className="ai-chat-content" component="div">
						<ScrollableFeed>
							<Stack className="ai-chat-main">
								<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
									<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
										<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32 }} />
									</Avatar>
									<div className="ai-msg-left">{t('AI Welcome Message')}</div>
								</Box>
								{messages.map((msg, idx) =>
									msg.role === 'user' ? (
										<Box key={idx} component="div" flexDirection="row" style={{ display: 'flex' }} alignItems="flex-end" justifyContent="flex-end" sx={{ m: '10px 0px' }}>
											<div className="ai-msg-right">{msg.content}</div>
										</Box>
									) : (
										<Box key={idx} flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
											<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
												<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
											</Avatar>
											<div className="ai-msg-left">{msg.content}</div>
										</Box>
									),
								)}
								{loading && (
									<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
										<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
											<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
										</Avatar>
										<div className="ai-msg-left ai-typing"><span></span><span></span><span></span></div>
									</Box>
								)}
							</Stack>
						</ScrollableFeed>
					</Box>
					<Box className="ai-chat-bott" component="div">
						<input type="text" className="ai-msg-input" placeholder={t('AI Input Placeholder')} value={input} onChange={getInputHandler} onKeyDown={getKeyHandler} disabled={loading} />
						<button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
							{loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : <SendIcon style={{ color: '#fff' }} />}
						</button>
					</Box>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="ai-chatting">
			<style>{`
				@keyframes ai-float {
					0%   { transform: translateY(0px); }
					50%  { transform: translateY(-8px); }
					100% { transform: translateY(0px); }
				}
				@keyframes ai-pulse-ring {
					0%   { box-shadow: 0 0 0 0 rgba(207, 100, 34, 0.4); }
					70%  { box-shadow: 0 0 0 14px rgba(207, 100, 34, 0); }
					100% { box-shadow: 0 0 0 0 rgba(207, 100, 34, 0); }
				}
				.ai-btn-open {
					animation: ai-float 2.5s ease-in-out infinite, ai-pulse-ring 2.5s ease-in-out infinite;
				}
				.ai-btn-open:hover {
					animation: ai-float 2.5s ease-in-out infinite, ai-pulse-ring 2.5s ease-in-out infinite;
					filter: drop-shadow(0 0 12px rgba(255, 200, 80, 0.85)) 
							drop-shadow(0 0 24px rgba(255, 160, 40, 0.5));
					transition: filter 0.4s ease;
				}
			`}</style>

			{openButton ? (
				<>
					{/* Ochish buttoni — faqat chat yopiq bo'lganda */}
					{!open && (
						<button
							className="ai-chat-button ai-btn-open"
							onClick={handleToggle}
							style={{
								bottom: '380px',
								background: 'transparent',
								boxShadow: 'none',
								zIndex: 99999,
							}}
						>
							<img src="/img/ai1.webp" alt="AI" style={{ width: 54, height: 74 }} />
						</button>
					)}

					{/* Yopish buttoni — faqat chat ochiq bo'lganda, pastda alohida */}
					{open && (
						<button
							onClick={handleToggle}
							style={{
								position: 'fixed',
								bottom: '100px', // 👈 pastda turadi
								right: '30px',
								width: '50px',
								height: '50px',
								borderRadius: '50%',
								background: '#cf6422',
								border: 'none',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0px 0px 10px 0px rgba(50,50,50,0.3)',
								zIndex: 99999, // 👈 hamma narsa ustida
							}}
						>
							<CloseFullscreenIcon style={{ color: '#fff' }} />
						</button>
					)}
				</>
			) : null}

			<Stack className={`ai-chat-frame ${open ? 'open' : ''}`}>
				<Box className="ai-chat-top" component="div">
					<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32, marginRight: '8px' }} />
					<span>{t('Zinfurn AI Assistant')}</span>
				</Box>
				<Box className="ai-chat-content" component="div">
					<ScrollableFeed>
						<Stack className="ai-chat-main">
							<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
								<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
									<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32 }} />
								</Avatar>
								<div className="ai-msg-left">{t('AI Welcome Message')}</div>
							</Box>
							{messages.map((msg, idx) =>
								msg.role === 'user' ? (
									<Box
										key={idx}
										component="div"
										flexDirection="row"
										style={{ display: 'flex' }}
										alignItems="flex-end"
										justifyContent="flex-end"
										sx={{ m: '10px 0px' }}
									>
										<div className="ai-msg-right">{msg.content}</div>
									</Box>
								) : (
									<Box key={idx} flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
										<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
											<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
										</Avatar>
										<div className="ai-msg-left">{msg.content}</div>
									</Box>
								),
							)}
							{loading && (
								<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
									<Avatar sx={{ bgcolor: '#cf6422', width: 42, height: 42, flexShrink: 0 }}>
										<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
									</Avatar>
									<div className="ai-msg-left ai-typing">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</Box>
							)}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className="ai-chat-bott" component="div">
					<input
						type="text"
						className="ai-msg-input"
						placeholder={t('AI Input Placeholder')}
						value={input}
						onChange={getInputHandler}
						onKeyDown={getKeyHandler}
						disabled={loading}
					/>
					<button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
						{loading ? (
							<CircularProgress size={18} style={{ color: '#fff' }} />
						) : (
							<SendIcon style={{ color: '#fff' }} />
						)}
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default AiChat;
