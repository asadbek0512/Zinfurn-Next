import React from 'react';

const categories = [
	{
		title: 'Kitchen',
		count: '1200+ Items',
		items: [
			'Dining Table',
			'Kitchen Cabinet',
			'Bar Stool',
			'Pantry Organizer',
			'Dish Rack',
			'Kitchen Island',
			'Cutlery Holder',
			'Microwave Stand',
		],
		image: '/img/banner/92.jpg', // o'zgartirilmagan
		size: 'large',
	},
	{
		title: 'Living Room',
		count: '950+ Items',
		items: ['Sofa', 'Coffee Table', 'TV Stand', 'Bookshelf'],
		image: '/img/banner/98.jpg', // o'zgartirilmagan
		size: 'small',
	},
	{
		title: 'Bedroom',
		count: '800+ Items',
		items: ['Bed Frame', 'Wardrobe', 'Nightstand', 'Dresser'],
		image: '/img/banner/96.jpg', // o'zgartirilmagan
		size: 'small',
	},
];

export default function CategoryCards() {
	return (
		<div className='category-filter' >
			<div className="category-grid">
				{categories.map((cat, idx) => (
					<div key={idx} className={`block ${cat.size}`}>
          <img src={cat.image} alt={cat.title} className="block-img" />
          <div className="overlay">
            <div className="count">{cat.count}</div>
            <h3>{cat.title}</h3>
            <ul>
              {cat.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
				))}
			</div>
		</div>
	);
}
