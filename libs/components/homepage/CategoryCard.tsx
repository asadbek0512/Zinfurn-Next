'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCategory } from '../../enums/property.enum';
import { useTranslation } from 'next-i18next'; // Tarjima

const CategoryGrid = () => {
	const router = useRouter();
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
};

export default CategoryGrid;
