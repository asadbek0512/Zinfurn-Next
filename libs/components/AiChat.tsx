import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, CircularProgress, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ScrollableFeed from 'react-scrollable-feed';
import { useRouter } from 'next/router';

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

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	const handleToggle = () => {
		setOpen((prev) => !prev);
	};

	const getInputHandler = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setInput(e.target.value);
		},
		[],
	);

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
			const res = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: updatedMessages }),
			});

			const data = await res.json();
			const aiMessage: AiMessage = { role: 'assistant', content: data.reply };
			setMessages((prev) => [...prev, aiMessage]);
		} catch (err) {
			const errMessage: AiMessage = {
				role: 'assistant',
				content: 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.',
			};
			setMessages((prev) => [...prev, errMessage]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Stack className="ai-chatting">
			{openButton ? (
				<button className="ai-chat-button" onClick={handleToggle}>
					{open ? <CloseFullscreenIcon /> : <SmartToyIcon />}
				</button>
			) : null}
			<Stack className={`ai-chat-frame ${open ? 'open' : ''}`}>
				<Box className="ai-chat-top" component="div">
					<SmartToyIcon style={{ marginRight: '8px', color: '#cf6422' }} />
					<span>Zinfurn AI Yordamchi</span>
				</Box>
				<Box className="ai-chat-content" component="div">
					<ScrollableFeed>
						<Stack className="ai-chat-main">
							<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
								<Avatar sx={{ bgcolor: '#cf6422', width: 32, height: 32 }}>
									<SmartToyIcon sx={{ fontSize: 18 }} />
								</Avatar>
								<div className="ai-msg-left">
									Salom! Men Zinfurn mebel do'konining AI yordamchisiman. Mebel haqida savol bering!
								</div>
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
										<Avatar sx={{ bgcolor: '#cf6422', width: 32, height: 32, flexShrink: 0 }}>
											<SmartToyIcon sx={{ fontSize: 18 }} />
										</Avatar>
										<div className="ai-msg-left">{msg.content}</div>
									</Box>
								),
							)}
							{loading && (
								<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
									<Avatar sx={{ bgcolor: '#cf6422', width: 32, height: 32, flexShrink: 0 }}>
										<SmartToyIcon sx={{ fontSize: 18 }} />
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
						placeholder="Mebel haqida savol bering..."
						value={input}
						onChange={getInputHandler}
						onKeyDown={getKeyHandler}
						disabled={loading}
					/>
					<button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
						{loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : <SendIcon style={{ color: '#fff' }} />}
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default AiChat;
