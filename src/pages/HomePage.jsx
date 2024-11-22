import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/firebase';
import ProductCard from '../components/ProductCard'; // Assuming ProductCard is a component that displays individual products
import ImageSlider from '../components/ImageSlider';
import styled, { keyframes } from 'styled-components';
import banner1 from '../assets/media/banner1.jpeg';
import banner2 from '../assets/media/banner2.jpg';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define constant slider images
  const sliderImages = [
    { type: 'image', url: banner1 },
    { type: 'image', url: banner2 },
  ];

  useEffect(() => {
    // Update document title and meta description
    document.title = 'Sui-Ichiba Marketplace';
    document.querySelector('meta[name="description"]').setAttribute(
      'content',
      'Shop the latest products on Sui-Ichiba Marketplace.'
    );
  }, []);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedProducts = await getProducts(); // Ensure getProducts fetches from Firebase or your API
        setProducts(fetchedProducts);
      } catch (error) {
        setError('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Spinner />; // Show spinner while loading
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <HomePageContainer>
      <WelcomeMessage>Welcome to Sui-Ichiba Marketplace</WelcomeMessage>
      <ImageSlider images={sliderImages} />
      {products.length === 0 ? (
        <p>No products available at the moment.</p>
      ) : (
        <ProductList>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductList>
      )}
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

const ErrorMessage = styled.div`
  text-align: center;
  color: red;
  font-size: 1.5rem;
  margin-top: 50px;
`;

