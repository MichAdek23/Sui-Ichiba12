import React, { useState } from "react";
import styled from "styled-components";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getApp } from "firebase/app"; // Ensure the Firebase app is initialized
import { uploadImage } from '../services/firebase';

// Styled Components (same as before)
const Container = styled.div`
  max-width: 600px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f2f2f2;
  box-shadow: inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff;

  &:focus {
    outline: 2px solid #007bff;
    background-color: #ffffff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f2f2f2;
  box-shadow: inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff;

  &:focus {
    outline: 2px solid #007bff;
    background-color: #ffffff;
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f2f2f2;
  box-shadow: inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff;

  &:focus {
    outline: 2px solid #007bff;
    background-color: #ffffff;
  }
`;

const FileInput = styled.input`
  padding: 0.5rem;
  font-size: 0.9rem;
  background: none;
  border: none;
  outline: none;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const ImagePreview = styled.div`
  position: relative;
  display: inline-block;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #ff4c4c;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  background-color: #007bff;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #b0c4de;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  text-align: center;
  font-size: 1rem;
  color: ${(props) => (props.error ? "red" : "green")};
  font-weight: bold;
  margin-top: 1rem;
`;

// Component
const AddProductPage = () => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    deliveryTime: "",
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Initialize Firestore
  const db = getFirestore(getApp()); // Use client-side SDK

  // Convert NGN to SUI
  const convertToSui = async (amount, currency = "ngn") => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=${currency.toLowerCase()}`
      );
      const data = await response.json();
      if (data.sui && data.sui[currency.toLowerCase()]) {
        return amount / data.sui[currency.toLowerCase()]; // Convert amount to SUI
      }
      throw new Error("Unable to fetch conversion rate.");
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
      throw error;
    }
  };

  // Handle price change with conversion to SUI
  const handlePriceChange = async (e) => {
    const value = e.target.value;
    setProductData((prevData) => ({ ...prevData, price: value }));

    if (value) {
      try {
        const priceInSui = await convertToSui(value, "ngn");
        setMessage(`Equivalent in SUI: ${priceInSui.toFixed(4)} SUI`);
      } catch {
        setMessage("Error converting to SUI.");
      }
    } else {
      setMessage("");
    }
  };

  // Handle input changes for other fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file selection for images
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles((prevFiles) => [...prevFiles, ...files]);
    setProductData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...filePreviews],
    }));
  };

  // Remove image preview
  const removeImage = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setProductData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, description, price, category, deliveryTime, images } = productData;

    // Validate form to avoid undefined values
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !deliveryTime ||
      images.length === 0 ||
      imageFiles.length === 0
    ) {
      setMessage("Please fill in all fields and upload at least one image.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Convert price to SUI
      const priceInSui = await convertToSui(price, "ngn");

      // Upload images to Firebase Storage
      const imageUploadPromises = imageFiles.map((file) => uploadImage(file));
      const uploadedImageURLs = await Promise.all(imageUploadPromises);

      // Prepare product data
      const productDataToSave = {
        name,
        description,
        price: priceInSui.toFixed(4), // Store price in SUI
        category,
        deliveryTime,
        images: uploadedImageURLs,
        createdAt: new Date().toISOString(),
      };

      // Ensure that product data is not undefined before saving
      if (!productDataToSave.name || !productDataToSave.price || !productDataToSave.category) {
        throw new Error("Invalid product data.");
      }

      // Save product to Firestore
      await addDoc(collection(db, "products"), productDataToSave);  // Add product to Firestore collection

      setMessage("Product added successfully!");
      setProductData({
        name: "",
        description: "",
        price: "",
        category: "",
        deliveryTime: "",
        images: [],
      });
      setImageFiles([]);
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Error adding product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Add a New Product</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Product Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={productData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Product Description</Label>
          <TextArea
            id="description"
            name="description"
            rows="4"
            value={productData.description}
            onChange={handleChange}
            placeholder="Enter product description"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="price">Price (NGN)</Label>
          <Input
            type="number"
            id="price"
            name="price"
            value={productData.price}
            onChange={handlePriceChange}
            placeholder="Enter price in NGN"
          />
          {message && <Message>{message}</Message>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            name="category"
            value={productData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home Appliances</option>
            <option value="others">Others</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="deliveryTime">Delivery Time (days)</Label>
          <Input
            type="number"
            id="deliveryTime"
            name="deliveryTime"
            value={productData.deliveryTime}
            onChange={handleChange}
            placeholder="Enter delivery time in days"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="images">Product Images</Label>
          <FileInput
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleFileSelection}
          />
          <ImagePreviewContainer>
            {productData.images.map((image, index) => (
              <ImagePreview key={index}>
                <PreviewImage src={image} alt={`Product Preview ${index}`} />
                <RemoveButton type="button" onClick={() => removeImage(index)}>
                  &times;
                </RemoveButton>
              </ImagePreview>
            ))}
          </ImagePreviewContainer>
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Add Product"}
        </Button>
      </Form>

      {message && <Message error={message.includes("Error")}>{message}</Message>}
    </Container>
  );
};

export default AddProductPage;
