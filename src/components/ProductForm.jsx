import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addProduct, updateProduct } from '../services/firebase';  // Import service functions
import styled from 'styled-components';  // Import Styled Components

const ProductForm = ({ productId, initialData, onSubmitSuccess }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      setLoading(false);
      return;
    }
  
    const productData = { name, price, description, imageUrl };
  
    try {
      if (image) {
        const storage = getStorage();
        const storageRef = ref(storage, `products/${image.name}`);
        await uploadBytes(storageRef, image);
        const imageUrl = await getDownloadURL(storageRef);
        productData.imageUrl = imageUrl;
      }
  
      if (productId) {
        await updateProduct(productId, productData);
        console.log('Product updated successfully');
      } else {
        const newProductId = await addProduct(productData);
        console.log('Product added successfully with ID:', newProductId);
      }
  
      onSubmitSuccess();
      setName('');
      setPrice('');
      setDescription('');
      setImage(null);
      setImageUrl('');
    } catch (err) {
      console.error('Error storing product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Form onSubmit={handleSubmit}>
      <Title>{productId ? 'Edit Product' : 'Add Product'}</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormGroup>
        <Label>Product Name:</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Price:</Label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          />
      </FormGroup>

      <FormGroup>
        <Label>Description:</Label>
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Product Image:</Label>
        <FileInput type="file" onChange={handleImageChange} />
        {imageUrl && <ProductImage src={imageUrl} alt="Product" />}
      </FormGroup>

      <SubmitButton type="submit" disabled={loading}>
        {loading ? 'Processing...' : productId ? 'Update Product' : 'Add Product'}
      </SubmitButton>
    </Form>
  );
};

export default ProductForm;

// Styled Components
const Form = styled.form`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  margin: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 15px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #555;
  display: block;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 5px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 5px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const FileInput = styled.input`
  margin-top: 5px;
`;

const ProductImage = styled.img`
  width: 100%;
  max-width: 150px;
  margin-top: 10px;
  border-radius: 8px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;

  &:disabled {
    background-color: #ccc;
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
`;
