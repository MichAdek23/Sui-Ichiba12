import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/firebase';
import ProductCard from '../components/ProductCard';
import ImageSlider from '../components/ImageSlider';
import styled, { keyframes } from 'styled-components';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Sui-Ichiba Marketplace";
    document.querySelector("meta[name='description']").setAttribute("content", "Shop the latest products on Sui-Ichiba Marketplace.");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedProducts = await getProducts();  // Fetch products from Firebase
        setProducts(fetchedProducts);

        const fetchedImages = [
          "https://via.placeholder.com/1200x400?text=Banner+1",
          "https://via.placeholder.com/1200x400?text=Banner+2",
          "https://via.placeholder.com/1200x400?text=Banner+3"
        ];
        setSliderImages(fetchedImages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Spinner />;  // Show spinner while loading
  }

  return (
    <HomePageContainer>
      <WelcomeMessage>Welcome to Sui-Ichiba Marketplace</WelcomeMessage>
      {sliderImages.length > 0 && <ImageSlider images={sliderImages} />}
      <ProductList>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductList>
    </HomePageContainer>
  );
};

export default HomePage;

// Styled Components

const HomePageContainer = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeMessage = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 30px;
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  justify-items: center;
  margin-top: 20px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
  margin: 100px auto;
`;
