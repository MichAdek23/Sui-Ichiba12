import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Navigate to the product details page
    navigate(`/product/${product.id}`);
  };

  return (
    <Card>
      <Image src={product.imageUrl} alt={product.name} />
      <Content>
        <ProductName>{product.name}</ProductName>
        <ProductPrice>${product.price}</ProductPrice>
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
