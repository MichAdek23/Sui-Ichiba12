import React, { useState, useEffect, useCallback } from 'react';
import { getAvailableProducts } from '../services/firebase'; // Service to fetch available products
import styled, { keyframes } from 'styled-components';

const ProductSearchPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]); // Default price range
  const [categories, setCategories] = useState([]);
  const [sortOption, setSortOption] = useState('priceAsc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAvailableProducts(); // Fetch products from API
        setProducts(data);
        setFilteredProducts(data);

        // Dynamically extract unique categories
        const uniqueCategories = [...new Set(data.map((product) => product.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = useCallback(() => {
    const filtered = products
      .filter((product) => {
        const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category ? product.category === category : true;
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesQuery && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortOption === 'priceAsc') return a.price - b.price;
        if (sortOption === 'priceDesc') return b.price - a.price;
        return 0;
      });

    setFilteredProducts(filtered);
  }, [products, searchQuery, category, priceRange, sortOption]);

  // Trigger search on input changes
  useEffect(() => {
    handleSearch();
  }, [searchQuery, category, priceRange, sortOption, handleSearch]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SearchPageContainer>
      <PageTitle>Find Your Perfect Product</PageTitle>

      {/* Search Bar */}
      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search by product name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <CategorySelect
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </CategorySelect>
        <SortSelect
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </SortSelect>
      </SearchBar>

      {/* Price Range */}
      <PriceRange>
        <label>Price Range:</label>
        <PriceInput
          type="number"
          min="0"
          value={priceRange[0]}
          onChange={(e) =>
            setPriceRange([Number(e.target.value), priceRange[1]])
          }
        />
        <span>to</span>
        <PriceInput
          type="number"
          min="0"
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], Number(e.target.value)])
          }
        />
      </PriceRange>

      {/* Product List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredProducts.length > 0 ? (
        <ProductList>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id}>
              <img src={product.image || '/placeholder.png'} alt={product.name} />
              <h3>{product.name}</h3>
              <p>Category: {product.category}</p>
              <p>Price: {product.price} SUI</p>
            </ProductCard>
          ))}
        </ProductList>
      ) : (
        <NoResults>No products match your search criteria.</NoResults>
      )}
    </SearchPageContainer>
  );
};

export default ProductSearchPage;

// Styled Components
const SearchPageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 5px;
  }
`;

const SearchInput = styled.input`
  flex: 2;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const CategorySelect = styled.select`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SortSelect = styled.select`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const PriceRange = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  text-align: center;

  img {
    max-width: 100%;
    height: auto;
    margin-bottom: 10px;
  }

  h3 {
    margin-bottom: 5px;
  }

  p {
    margin: 5px 0;
  }
`;

const NoResults = styled.p`
  text-align: center;
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
  margin: 50px auto;
  animation: ${spin} 1s linear infinite;
`;
