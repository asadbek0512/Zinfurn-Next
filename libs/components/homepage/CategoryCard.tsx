'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCategory } from '../../enums/property.enum';
import { useTranslation } from 'next-i18next'; // Tarjima
import useDeviceDetect from '../../hooks/useDeviceDetect';

const CategoryGrid = () => {
	const router = useRouter();
	const device = useDeviceDetect();

	const { t } = useTranslation('common'); // common.json dan tarjima

	const items = [
		{
			id: 1,
			title: t('Kitchen Collection'),
			subtitle: t('Modern and Practical'),
			image: '/img/banner/93.jpg',
			className: 'large-top-left',
			category: PropertyCategory.KITCHEN,
		},
		{
			id: 2,
			title: t('Office Furniture'),
			subtitle: t('Work in Style'),
			image: '/img/banner/office7.jpg',
			className: 'small-bottom-left',
			category: PropertyCategory.OFFICE,
		},
		{
			id: 3,
			title: t('Bathroom Interior'),
			subtitle: t('Refresh Your Space'),
			image: '/img/banner/bathroom3.jpg',
			className: 'small-bottom-middle',
			category: PropertyCategory.BATHROOM,
		},
		{
			id: 4,
			title: t('Home Essentials'),
			subtitle: t('Comfort for Your Living Space'),
			image: '/img/banner/home1.jpg',
			className: 'very-large-right',
			category: PropertyCategory.HOME,
		},
	];

	const handleClick = (category: string) => {
		const searchFilter = {
			page: 1,
			limit: 9,
			search: {
				pricesRange: { start: 0, end: 2000000 },
				categoryList: [category],
			},
		};

		const query = `/property?input=${encodeURIComponent(JSON.stringify(searchFilter))}`;
		router.push(query);
	};
	if (device === 'mobile') {
		const imgStyle: React.CSSProperties = {
			position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
		};
		const overlay = (pad = '8px 10px'): React.CSSProperties => ({
			position: 'absolute', bottom: 0, left: 0, right: 0,
			padding: pad,
			background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
			color: 'white',
		});
		const card = (h: string): React.CSSProperties => ({
			position: 'relative', height: h, borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
		});

		return (
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px' }}>

				{/* Chap: yuqorida 1ta, pastda 2ta */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
					{/* Yuqori katta */}
					<div style={card('120px')} onClick={() => handleClick(items[0].category)}>
						<img src={items[0].image || '/placeholder.svg'} alt={items[0].title} style={imgStyle} />
						<div style={overlay()}>
							<div style={{ fontSize: '12px', fontWeight: 600 }}>{items[0].title}</div>
						</div>
					</div>
					{/* Pastda 2ta yonma-yon */}
					<div style={{ display: 'flex', gap: '8px', flex: 1 }}>
						{[items[1], items[2]].map((item) => (
							<div key={item.id} style={{ ...card('90px'), flex: 1 }} onClick={() => handleClick(item.category)}>
								<img src={item.image || '/placeholder.svg'} alt={item.title} style={imgStyle} />
								<div style={overlay('6px 8px')}>
									<div style={{ fontSize: '10px', fontWeight: 600 }}>{item.title}</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* O'ng: 1ta baland karta */}
				<div style={{ ...card('100%'), minHeight: '218px' }} onClick={() => handleClick(items[3].category)}>
					<img src={items[3].image || '/placeholder.svg'} alt={items[3].title} style={imgStyle} />
					<div style={overlay('10px 12px')}>
						<div style={{ fontSize: '13px', fontWeight: 600 }}>{items[3].title}</div>
						<div style={{ fontSize: '10px', opacity: 0.85 }}>{items[3].subtitle}</div>
					</div>
				</div>

			</div>
		);
	} else {
		return (
			<div className="category-grid">
				{items.map((item) => (
					<div className={`box ${item.className}`} key={item.id}>
						<img src={item.image || '/placeholder.svg'} alt={item.title} />
						<div className="overlay">
							<div className="content">
								<h3>{item.title}</h3>
								{item.subtitle && <p>{item.subtitle}</p>}
								<button className="explore-btn" onClick={() => handleClick(item.category)}>
									{t('Explore')}
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}
};

export default CategoryGrid;
