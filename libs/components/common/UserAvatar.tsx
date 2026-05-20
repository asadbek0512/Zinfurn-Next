import React, { useState } from 'react';

const COLORS = [
	'#E53935', '#D81B60', '#8E24AA', '#5E35B1',
	'#1E88E5', '#00897B', '#43A047', '#FB8C00',
	'#F4511E', '#6D4C41', '#546E7A', '#039BE5',
];

function getColor(nick: string): string {
	let hash = 0;
	for (let i = 0; i < nick.length; i++) hash = nick.charCodeAt(i) + ((hash << 5) - hash);
	return COLORS[Math.abs(hash) % COLORS.length];
}

interface UserAvatarProps {
	src?: string;
	nick?: string;
	size: number;
	className?: string;
}

const UserAvatar = ({ src, nick = '', size, className = '' }: UserAvatarProps) => {
	const [imgError, setImgError] = useState(false);

	const showImg = src && !src.includes('defaultUser') && !imgError;
	const letter = (nick || '?')[0].toUpperCase();
	const bg = getColor(nick || '?');

	return (
		<div
			className={className}
			style={{
				width: size,
				height: size,
				borderRadius: '50%',
				backgroundColor: bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#fff',
				fontWeight: 700,
				fontSize: size * 0.4,
				flexShrink: 0,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{letter}
			{showImg && (
				<img
					src={src}
					alt={nick}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						border: 'none',
						borderRadius: 0,
					}}
					onError={() => setImgError(true)}
				/>
			)}
		</div>
	);
};

export default UserAvatar;
