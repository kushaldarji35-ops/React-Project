import React from "react";
import "./Categories.css";
import photo1 from "../../assets/photo1.webp"; 
import photo2 from "../../assets/photo2.webp";  
import photo3 from "../../assets/photo3.webp"; 
import photo4 from "../../assets/photo4.webp"; 
import photo5 from  "../../assets/photo5.webp";

const categories = [
  {
    id: 1,
    name: "EARRINGS",
    image: photo1,
  },
  {
    id: 2,
    name: "FINGER RINGS",
    image: photo2,
  },
  {
    id: 3,
    name: "PENDANTS",
    image: photo3,
  },
  {
    id: 4,
    name: "MANGALSUTRA",
    image: photo4,
  },
  {
    id: 5,
    name: "BRACELETS",
    image: photo5,
  },
];

function Categories() {
  return (
    <div className="categories-grid">
      {categories.map((cat) => (
        <div className="category-card" key={cat.id}>
          <div className="category-image-wrapper">
            <img src={cat.image} alt={cat.name} className="category-image" />
          </div>
          <h3 className="category-title">{cat.name}</h3>
        </div>
      ))}
    </div>
  );
}

export default Categories;
