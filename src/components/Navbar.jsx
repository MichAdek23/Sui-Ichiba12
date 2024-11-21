import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Navbar = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // State to manage menu visibility
  const menuRef = useRef(null); // Ref to the navbar to detect clicks outside

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/sign-in');  // Redirect to sign-in page after logout
    } catch (err) {
      console.error('Sign-out failed', err.message);
    }
  };

  // Close menu when clicking outside of the navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <Nav ref={menuRef}>
      <Logo to="/">Sui-Ichiba</Logo>
      <HamburgerMenu onClick={() => setMenuOpen(!menuOpen)}>&#9776;</HamburgerMenu>
      <NavLinks isOpen={menuOpen}>
        <StyledLink to="/" onClick={() => setMenuOpen(false)}>Home</StyledLink>
        {auth.currentUser ? (
          <>
            <StyledLink to="/product-search-page" onClick={() => setMenuOpen(false)}>Search</StyledLink>
            <StyledLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</StyledLink>
            <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
          </>
        ) : (
          <>
            <StyledLink to="/product-search-page" onClick={() => setMenuOpen(false)}>Search</StyledLink>
            <StyledLink to="/sign-in" onClick={() => setMenuOpen(false)}>Sign In to Get Started</StyledLink>
          </>
        )}
      </NavLinks>
    </Nav>
  );
};

export default Navbar;

// Styled Components (no changes)
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: #007bff;
  color: white;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Logo = styled(Link)`
  font-size: 28px;
  color: white;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 1px;

  &:hover {
    color: #f5a623;
    transition: color 0.3s ease;
  }
`;

const HamburgerMenu = styled.div`
  display: none;
  font-size: 30px;
  cursor: pointer;
  color: white;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background-color: #007bff;
    position: absolute;
    top: 0;
    left: 0;
    padding: 20px;
    box-sizing: border-box;
  }
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: 600;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #f5a623;
    color: white;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 15px;
  }
`;

const SignOutButton = styled.button`
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff1a1a;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 12px 15px;
  }
`;
