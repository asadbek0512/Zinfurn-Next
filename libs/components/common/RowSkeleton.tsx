import React from 'react';

/** Uzun qatorli element shakli (buyurtma / mulk / suhbat ro'yxati) — yuklanish shimmer skeleton */
const RowSkeleton = () => {
	return (
		<div className="zf-skel-row">
			<div className="zf-skeleton zf-skel-row-thumb" />
			<div className="zf-skel-row-body">
				<div className="zf-skeleton zf-skel-line" />
				<div className="zf-skeleton zf-skel-line short" />
			</div>
			<div className="zf-skeleton zf-skel-row-chip" />
		</div>
	);
};

export default RowSkeleton;
