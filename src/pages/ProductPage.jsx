import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import { getProduct } from '../services/firebase';
import { confirmDelivery } from '../services/blockchain'; // Correct blockchain imports
import styled from 'styled-components'; // Import styled-components

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setError('');
      try {
        const productData = await getProduct(id);
        setProduct(productData);
      } catch (err) {
        setError('Product not found.');
      }
    };

    fetchProduct();
  }, [id]);

  const handleCreateEscrow = () => {
    // Redirect to the escrow creation page with the product ID as a query parameter
    window.location.href = `/escrow?productId=${id}`;
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

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <ProductPageContainer>
      <ProductTitle>{product.name}</ProductTitle>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <ProductDetails>
        <p>
          <strong>Price:</strong> {product.price} Sui
        </p>
        <p>
          <strong>Description:</strong> {product.description}
        </p>
      </ProductDetails>

      <Button onClick={handleCreateEscrow}>Create Escrow for Purchase</Button>
      
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
  color: #28a745; // Green for success messages
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1rem;
  color: #dc3545; // Red for error messages
`;
