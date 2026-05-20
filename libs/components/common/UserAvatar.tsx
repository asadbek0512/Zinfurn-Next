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
	className?: string;
	alt?: string;
	style?: React.CSSProperties;
}

const UserAvatar = ({ src, nick = '', className = '', alt = '', style }: UserAvatarProps) => {
	const [imgError, setImgError] = useState(false);

	const showFallback = !src || imgError;
	const letter = (nick || '?')[0].toUpperCase();
	const bg = getColor(nick || '?');

	if (showFallback) {
		return (
			<div
				className={className}
				style={{
					background: bg,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#fff',
					fontWeight: 700,
					fontSize: '0.9em',
					borderRadius: '50%',
					flexShrink: 0,
					...style,
				}}
			>
				{letter}
			</div>
		);
	}

	return (
		<img
			className={className}
			src={src}
			alt={alt}
			style={style}
			onError={() => setImgError(true)}
		/>
	);
};

export default UserAvatar;
