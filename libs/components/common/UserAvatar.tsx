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

	const validSrc: string | undefined = src && !src.includes('defaultUser') && !imgError ? src : undefined;
	const letter = (nick || '?')[0].toUpperCase();
	const bg = getColor(nick || '?');

	const w = style?.width ?? '100%';
	const h = style?.height ?? '100%';

	if (validSrc) {
		return (
			<img
				className={className}
				src={validSrc}
				alt={alt}
				style={style}
				onError={() => setImgError(true)}
			/>
		);
	}

	return (
		<svg
			className={className}
			viewBox="0 0 40 40"
			xmlns="http://www.w3.org/2000/svg"
			style={{ width: w, height: h, flexShrink: 0, display: 'block', ...(style || {}) }}
		>
			<circle cx="20" cy="20" r="20" fill={bg} />
			<text
				x="20"
				y="26"
				textAnchor="middle"
				fill="#ffffff"
				fontSize="18"
				fontWeight="bold"
				fontFamily="Arial, sans-serif"
			>
				{letter}
			</text>
		</svg>
	);
};

export default UserAvatar;
