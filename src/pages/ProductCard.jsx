import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import placeholder from '../assets/media/placeholde.png';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  const handleImageError = () => {
    setImageError(true); // Set the error flag to true if the image fails to load
  };

  return (
    <Card>
      <Image
        src={imageError ? placeholder : product.imageUrl} // Use placeholder if image fails
        alt={product.name}
        onError={handleImageError} // Trigger when image fails to load
      />
      <Content>
        <ProductName>{product.name}</ProductName>
        <ProductPrice>{product.price} Sui</ProductPrice>
        <Button onClick={handleViewDetails}>View Details</Button>
      </Content>
    </Card>
  );
};

export default ProductCard;

// Styled Components
const Card = styled.div`
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 16px;
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 16px;
  text-align: center;
`;

const ProductName = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
`;

const ProductPrice = styled.p`
  font-size: 16px;
  color: #007bff;
  margin-bottom: 16px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #0056b3;
  }
`;
