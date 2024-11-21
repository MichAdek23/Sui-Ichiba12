import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
  color: #333;
  font-size: 2rem;
  flex-direction: column;
  text-align: center;
`;

const LinkToHome = styled.div`
  margin-top: 20px;
  font-size: 1.2rem;
  a {
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Redirect to the previous page the user was on, or to the homepage if unavailable
      const previousLocation = location.state?.from || '/';
      navigate(previousLocation);
    }, 5000); // Redirect after 5 seconds

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, [location, navigate]);

  return (
    <NotFoundContainer>
      <p>404 - Page Not Found</p>
      <LinkToHome>
        <Link to="/">Return to Sui-Ichiba Homepage</Link>
      </LinkToHome>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
