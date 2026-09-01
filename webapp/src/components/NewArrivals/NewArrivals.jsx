import React from "react";
import "./NewArrivals.css";
import arrival1 from "../../assets/arrival1.webp";
import arrival2 from "../../assets/arrival2.webp";
import bannerBg from "../../assets/new-arrivals-background.webp";

const arrivalItems = [
  {
    id: 1,
    title: "Silver Idols",
    image: arrival1,
  },
  {
    id: 2,
    title: "Station Mangalsutra",
    image: arrival2,
  }
];

function NewArrivals() {
  return (
    <div className="new-arrivals-container">
      <div 
        className="new-arrivals-banner"
        style={{ backgroundImage: `url(${bannerBg})` }}
      />
      <div className="new-arrivals-grid">
        {arrivalItems.map((item) => (
          <div key={item.id} className="new-arrival-card">
            <img 
              src={item.image} 
              alt={item.title} 
              className="new-arrival-image"
              onError={(e) => {
                if (item.fallbackImage && e.target.src !== item.fallbackImage) {
                  e.target.src = item.fallbackImage;
                }
              }}
            />
            <div className="new-arrival-overlay">
              <h3 className="new-arrival-title">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewArrivals;
