import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getProduct } from '../services/firebase';
import { createEscrow, confirmPurchase } from '../services/blockchain'; // Import blockchain functions
import styled from 'styled-components';

const EscrowPage = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const productId = queryParams.get('productId');
  const [product, setProduct] = useState(null);
  const [buyerBalance, setBuyerBalance] = useState(0);
  const [isPurchaseConfirmed, setIsPurchaseConfirmed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(productId);
        setProduct(productData);
      } catch (err) {
        console.error('Product not found.');
      }
    };

    const fetchBuyerBalance = async () => {
      setBuyerBalance(1000); // Placeholder value, adjust with real balance fetching logic
    };

    fetchProduct();
    fetchBuyerBalance();
  }, [productId]);

  const handleConfirmPurchase = async () => {
    if (buyerBalance >= product.price) {
      try {
        // Assuming the buyer's signer is available, fetch the buyer's wallet
        const buyerSigner = await getBuyerSigner(); // Function to fetch the buyer's signer (wallet)

        const response = await createEscrow(buyerSigner, product.seller, productId, product.price);
        console.log('Escrow created:', response);
        setIsPurchaseConfirmed(true);
      } catch (error) {
        console.error('Error creating escrow:', error);
      }
    } else {
      alert('Insufficient balance.');
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      // Assuming the buyer's signer is available
      const buyerSigner = await getBuyerSigner(); 

      const response = await confirmPurchase(product, buyerSigner);
      console.log('Purchase confirmed:', response);
    } catch (error) {
      console.error('Error confirming purchase:', error);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <EscrowPageContainer>
      <EscrowTitle>Escrow for {product.name}</EscrowTitle>
      <p>
        <strong>Price:</strong> {product.price} Sui
      </p>
      <p>
        <strong>Description:</strong> {product.description}
      </p>

      <ChatSection>
        <p>Chat with Seller:</p>
        {/* Render chat interface here */}
      </ChatSection>

      {!isPurchaseConfirmed ? (
        <Button onClick={handleConfirmPurchase}>Confirm to Buy</Button>
      ) : (
        <div>
          <p>Purchase confirmed. Awaiting delivery confirmation.</p>
          <Button onClick={handleConfirmDelivery}>Confirm Delivery</Button>
        </div>
      )}
    </EscrowPageContainer>
  );
};

export default EscrowPage;

// Styled Components
const EscrowPageContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const EscrowTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
`;

const ChatSection = styled.div`
  margin: 20px 0;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 8px;
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
