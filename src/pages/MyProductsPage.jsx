import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getProducts, deleteProduct } from "../services/firebase"; // Import necessary Firebase functions
import { useNavigate } from 'react-router-dom';

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 12px;
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
  box-shadow: 4px 4px 10px #d1d1d1, -4px -4px 10px #ffffff;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
`;

const ProductName = styled.h3`
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ProductDescription = styled.p`
  color: #555;
  font-size: 1rem;
  margin: 1rem 0;
`;

const ProductPrice = styled.p`
  font-size: 1.1rem;
  color: #007bff;
  font-weight: bold;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const NoProductsMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  margin: 2rem 0;
`;

const AddProductButton = styled(Button)`
  background-color: #28a745;

  &:hover {
    background-color: #218838;
  }
`;

// Component
const MyProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts(); // Assuming getProducts fetches all products of the current user
        setProducts(productsData);
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product removal
  const handleRemove = async (productId) => {
    try {
      await deleteProduct(productId); // Assuming deleteProduct is implemented to remove the product from Firestore
      setProducts(products.filter((product) => product.id !== productId)); // Remove product from state
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container>
      <Title>My Products</Title>
      {loading ? (
        <NoProductsMessage>Loading your products...</NoProductsMessage>
      ) : products.length === 0 ? (
        <NoProductsMessage>
          Hey, you have no products for sale yet.{" "}
          <AddProductButton onClick={() => navigate("/dashboard")}>Add a Product</AddProductButton>
        </NoProductsMessage>
      ) : (
        <ProductList>
          {products.map((product) => (
            <ProductCard key={product.id}>
              <ProductName>{product.name}</ProductName>
              <ProductDescription>{product.description}</ProductDescription>
              <ProductPrice>{product.price}</ProductPrice>
              <ProductActions>
                <Button onClick={() => navigate(`/edit-product/${product.id}`)}>Edit</Button>
                <Button onClick={() => handleRemove(product.id)}>Remove</Button>
              </ProductActions>
            </ProductCard>
          ))}
        </ProductList>
      )}
      {message && <NoProductsMessage>{message}</NoProductsMessage>}
    </Container>
  );
};

export default MyProductsPage;
