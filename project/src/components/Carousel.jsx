import React, { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [images.length]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (images.length));
      setIsTransitioning(false);
    }, 500); // Match the CSS transition duration
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 500); // Match the CSS transition duration
  };

  return (
    <div className="carousel-container">
      {/* <button className="carousel-btn prev-btn" onClick={handlePrev}>
        ❮
      </button> */}
      <div className="carousel-slide" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Carousel Item ${index + 1}`}
            className={`carousel-image`}
          />
        ))}
      </div>
      {/* <button className="carousel-btn next-btn" onClick={handleNext}>
        ❯
      </button> */}
    </div>
  );
};

export default Carousel;
