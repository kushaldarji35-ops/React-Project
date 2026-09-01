import { useState, useEffect, useCallback } from "react";
import "./HeroBanner.css";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.webp";
import image3 from "../../assets/image3.webp";
import image4 from "../../assets/image4.webp";

const slides = [
    {
        image: image1,
        tag: "TIMELESS DIAMOND JEWELLERY",
        heading: "UP TO 100% OFF",
        subheading: "ON MAKING CHARGES",
        description: "Applicable On All Diamond Jewellery Designs",
        btn: "SHOP NOW",
    },
    {
        image: image2,
        tag: "EXCLUSIVE GOLD COLLECTION",
        heading: "FLAT 30% OFF",
        subheading: "ON ALL GOLD EARRINGS",
        description: "Handcrafted With Love — Limited Time Offer",
        btn: "EXPLORE NOW",
    },
    {
        image: image3,
        tag: "LUXURY BANGLE COLLECTION",
        heading: "BUY 1 GET 1 FREE",
        subheading: "ON PREMIUM BANGLES",
        description: "Finest Craftsmanship, Unbeatable Prices",
        btn: "VIEW COLLECTION",
    },
    {
        image: image4,
        tag: "FESTIVE SPECIAL",
        heading: "UP TO 50% OFF",
        subheading: "SITEWIDE SALE",
        description: "Celebrate Every Occasion With Our Finest Pieces",
        btn: "SHOP THE SALE",
    },
];

function HeroBanner() {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);

    const goTo = useCallback(
        (index) => {
            if (animating) return;
            setAnimating(true);
            setTimeout(() => {
                setCurrent(index);
                setAnimating(false);
            }, 400);
        },
        [animating]
    );

    const prev = () => goTo((current - 1 + slides.length) % slides.length);
    const next = useCallback(
        () => goTo((current + 1) % slides.length),
        [current, goTo]
    );

    // Auto-slide every 4 seconds
    useEffect(() => {
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [next]);

    const slide = slides[current];

    return (
        <div className="hero-banner">
            {/* Background Image */}
            <div
                className={`hero-bg ${animating ? "hero-bg--fade" : ""}`}
                style={{ backgroundImage: `url(${slide.image})` }}
            />

            {/* Dark overlay */}
            <div className="hero-overlay" />

            {/* Content */}
            <div className={`hero-content ${animating ? "hero-content--fade" : ""}`}>
                <div className="hero-tag">{slide.tag}</div>
                <h1 className="hero-heading">{slide.heading}</h1>
                <p className="hero-subheading">{slide.subheading}</p>
                <p className="hero-description">{slide.description}</p>
                <button className="hero-btn">{slide.btn}</button>
            </div>

            {/* Navigation Arrows */}
            <button className="hero-arrow hero-arrow--left" onClick={prev} aria-label="Previous">
                &#8249;
            </button>
            <button className="hero-arrow hero-arrow--right" onClick={next} aria-label="Next">
                &#8250;
            </button>

            {/* Slide Counter */}
            <div className="hero-counter">
                <span className="hero-counter-current">
                    {String(current + 1).padStart(2, "0")}
                </span>
                <span className="hero-counter-line" key={current} />
            </div>

            {/* Dots */}
            <div className="hero-dots">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`hero-dot ${i === current ? "hero-dot--active" : ""}`}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default HeroBanner;
