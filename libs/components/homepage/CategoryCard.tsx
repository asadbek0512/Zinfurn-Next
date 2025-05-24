import React from 'react';

const items = [
  {
    id: 1,
    title: "Minimal Chair",
    subtitle: "Modern Living Room",
    image: "/img/banner/93.jpg",
    className: "large-top-left",
  },
  {
    id: 2,
    title: "Modern Chair",
    subtitle: "",
    image: "/img/banner/98.jpg",
    className: "small-bottom-left",
  },
  {
    id: 3,
    title: "Modern Sofa Set",
    subtitle: "",
    image: "/img/banner/89.jpg",
    className: "small-bottom-middle",
  },
  {
    id: 4,
    title: "Modern Interior Collection Sets",
    subtitle: "",
    image: "/img/banner/99.jpg",
    className: "very-large-right",
  },
]

export default function CategoryGrid() {
  return (
    <div className="category-grid">
      {items.map((item) => (
        <div className={`box ${item.className}`} key={item.id}>
          <img src={item.image || "/placeholder.svg"} alt={item.title} />
          <div className="overlay">
            <div className="content">
              <h3>{item.title}</h3>
              {item.subtitle && <p>{item.subtitle}</p>}
              <button className="explore-btn">Explore</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
