import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/firebase'; // Get all products
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components'; // Import styled-components

const ProductSearchPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000); // Set default max price
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Manage loading state
  const [selectedCategory, setSelectedCategory] = useState(''); // State for selected category
  const [categories, setCategories] = useState([]); // State to store categories

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productData = await getProducts(); // Get all products
        setProducts(productData);

        // Assuming productData has a 'category' field, get unique categories
        const uniqueCategories = [
          ...new Set(productData.map((product) => product.category)),
        ];
        setCategories(uniqueCategories); // Set unique categories
        setLoading(false); // Stop loading once products are fetched
      } catch (err) {
        console.error('Error fetching products', err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = () => {
    setFilteredProducts(
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          product.price >= minPrice &&
          product.price <= maxPrice &&
          (selectedCategory ? product.category === selectedCategory : true) // Filter by category if selected
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); // Trigger search when Enter is pressed
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch();
    }, 500); // Delay of 500ms before applying the filter

    return () => clearTimeout(debounce); // Clean up the debounce timer
  }, [searchQuery, minPrice, maxPrice, products, selectedCategory]);

  return (
    <SearchPageContainer>
      <PageTitle>Search Products</PageTitle>

      {/* Search Bar */}
      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search by product name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress} // Listen for Enter key press
        />
        <SearchButton onClick={handleSearch}>Search</SearchButton> {/* Search Button */}
      </SearchBar>

      {/* Price Filter */}
      <FilterBar>
        <label>Min Price:</label>
        <PriceInput
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(Number(e.target.value))}
        />
        <label>Max Price:</label>
        <PriceInput
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
      </FilterBar>

      {/* Category Filter */}
      <CategoryFilter>
        <label>Category:</label>
        <CategorySelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </CategorySelect>
      </CategoryFilter>

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner /> // Show spinner while loading
      ) : (
        <ProductList>
          {filteredProducts.length === 0 ? (
            <NoResults>No products found.</NoResults>
          ) : (
            filteredProducts.map((product) => (
              <ProductItem key={product.id}>
                <ProductLink to={`/product/${product.id}`}>
                  {product.name} - ${product.price}
                </ProductLink>
              </ProductItem>
            ))
          )}
        </ProductList>
      )}
    </SearchPageContainer>
  );
};

export default ProductSearchPage;

// Styled Components
const SearchPageContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 15px;
    max-width: 100%;
  }
`;

const PageTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  color: #333;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px; /* Add gap between search input and button */
`;

const SearchInput = styled.input`
  padding: 10px;
  width: 80%;
  max-width: 400px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  @media (max-width: 768px) {
    width: 70%;
  }
`;

const SearchButton = styled.button`
  padding: 10px;
  background-color: #3498db;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #2980b9;
  }
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;

  label {
    font-size: 1rem;
    color: #333;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const PriceInput = styled.input`
  padding: 8px;
  width: 80px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  @media (max-width: 768px) {
    width: 60px;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  label {
    font-size: 1rem;
    color: #333;
  }
`;

const CategorySelect = styled.select`
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

const ProductItem = styled.li`
  font-size: 1rem;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 10px 0;
  }
`;

const ProductLink = styled(Link)`
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NoResults = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #777;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;  
  border-top: 4px solid #3498db;  
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
  margin: 100px auto;
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;
