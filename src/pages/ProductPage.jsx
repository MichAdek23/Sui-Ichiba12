import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts, getSeller } from '../services/firebase'; // Removed initiateEscrow import
import { confirmDelivery } from '../services/blockchain';
import styled from 'styled-components';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setError('');
      try {
        const productData = await getProducts(id);
        setProduct(productData);
        
        const sellerData = await getSeller(productData.sellerId);
        setSeller(sellerData);
      } catch (err) {
        setError('Product not found.');
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - Sui Marketplace`;
    }
  }, [product]);

  const handleCreateEscrow = () => {
    // Redirect to the escrow page with product ID and seller info
    navigate(`/escrow?productId=${id}&sellerId=${product.sellerId}`);
  };

  const handleConfirmDelivery = async () => {
    setDeliveryStatus('Confirming delivery...');
    try {
      await confirmDelivery(id); // Blockchain confirmation
      setDeliveryStatus('Delivery confirmed!');
    } catch (err) {
      setDeliveryStatus('Failed to confirm delivery.');
    }
  };

  const handleChatWithSeller = () => {
    // Redirect to the chat page
    navigate(`/chat/${seller.id}`);
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <ProductPageContainer>
      <ProductTitle>{product.name}</ProductTitle>
      {error && <ErrorMessage>{error}</ErrorMessage>} {/* Used ErrorMessage here */}
      <ProductDetails>
        <p>
          <strong>Price:</strong> {product.price} Sui
        </p>
        <p>
          <strong>Description:</strong> {product.description}
        </p>
        <p>
          <strong>Seller:</strong> {seller ? seller.username : 'Loading...'} 
          <Rating>{seller?.rating || 'N/A'}</Rating> 
        </p>
      </ProductDetails>

      <Button onClick={handleChatWithSeller}>Chat with Seller</Button>
      <Button onClick={handleCreateEscrow}>Finalize Purchase</Button>

      <Button onClick={handleConfirmDelivery}>Confirm Delivery</Button>
      {deliveryStatus && <StatusMessage>{deliveryStatus}</StatusMessage>}
    </ProductPageContainer>
  );
};

export default ProductPage;

// Styled Components
const ProductPageContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const ProductTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
`;

const ProductDetails = styled.div`
  font-size: 1.2rem;
  margin-bottom: 30px;
  p {
    margin: 10px 0;
  }
`;

const Rating = styled.span`
  font-weight: bold;
  color: gold;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  font-size: 1.1rem;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  margin: 10px auto;
  display: block;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const StatusMessage = styled.p`
  text-align: center;
  font-size: 1rem;
  margin-top: 10px;
  color: #28a745;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1rem;
  color: #dc3545;
`;
