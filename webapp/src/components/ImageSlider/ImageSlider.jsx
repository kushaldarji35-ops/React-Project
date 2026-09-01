import "./ImageSlider.css";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.webp";
import image3 from "../../assets/image3.webp";
import image4 from "../../assets/image4.webp";
function ImageSlider() {

    const images = [
        image1,
        image2,
        image3,
        image4
    ];

    return (
        <div className="slider">
            <div className="slider-track">

                {images.map((image, index) => (
                    <div className="slider-card" key={index}>
                        <img src={image} alt={`Slide ${index + 1}`} />
                    </div>
                ))}

                {/* Duplicate images for continuous movement */}

                {images.map((image, index) => (
                    <div className="slider-card" key={`duplicate-${index}`}>
                        <img src={image} alt={`Slide ${index + 1}`} />
                    </div>
                ))}

            </div>
        </div>
    );
}

export default ImageSlider;