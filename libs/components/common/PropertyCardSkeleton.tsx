import React from 'react';

/** Mahsulot kartasi shakli — yuklanayotganda ko'rsatiladigan shimmer skeleton */
const PropertyCardSkeleton = () => {
	return (
		<div className="zf-skel-card">
			<div className="zf-skeleton zf-skel-img" />
			<div className="zf-skeleton zf-skel-line" />
			<div className="zf-skeleton zf-skel-line short" />
			<div className="zf-skeleton zf-skel-line price" />
		</div>
	);
};

export default PropertyCardSkeleton;
