import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Example images (Replace with your own)
const images = [
  'https://via.placeholder.com/800x400?text=Image+1',
  'https://via.placeholder.com/800x400?text=Image+2',
  'https://via.placeholder.com/800x400?text=Image+3',
  'https://via.placeholder.com/800x400?text=Image+4',
];

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  // Automatically switch slides every 5 seconds
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <SliderContainer>
      <SliderWrapper>
        {images.map((image, index) => (
          <Slide
            key={index}
            isVisible={index === currentSlide}
            style={{ backgroundImage: `url(${image})` }}
          ></Slide>
        ))}
      </SliderWrapper>
      <ArrowButton direction="left" onClick={prevSlide}>
        &#10094;
      </ArrowButton>
      <ArrowButton direction="right" onClick={nextSlide}>
        &#10095;
      </ArrowButton>
      <DotsContainer>
        {images.map((_, index) => (
          <Dot
            key={index}
            isActive={index === currentSlide}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </DotsContainer>
    </SliderContainer>
  );
};

export default ImageSlider;

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: auto;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const SliderWrapper = styled.div`
  display: flex;
  position: relative;
  width: 100%;
`;

const Slide = styled.div`
  min-width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  transition: opacity 0.8s ease;
  opacity: ${(props) => (props.isVisible ? '1' : '0')};
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  ${(props) => (props.direction === 'left' ? 'left: 10px;' : 'right: 10px;')}
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => (props.isActive ? '#1c7ed6' : '#ccc')};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #555;
  }
`;
