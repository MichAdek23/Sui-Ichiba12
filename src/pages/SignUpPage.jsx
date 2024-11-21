import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!formData.phone.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/dashboard');
      setSuccess('Sign-up successful!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSocialSignUp = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
      setSuccess('Social sign-up successful!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SignUpContainer>
      <Form onSubmit={handleSignUp}>
        <h2>Sign Up</h2>

        <Label>Email</Label>
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
        />

        <Label>Password</Label>
        <Input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
        />

        <Label>Confirm Password</Label>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />

        <Label>Phone Number</Label>
        <Input
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleInputChange}
        />

        {error && <Error>{error}</Error>}
        {success && <Success>{success}</Success>}

        <Button type="submit">Sign Up</Button>

        <SocialButtons>
          <Button type="button" onClick={() => handleSocialSignUp(googleProvider)}>
            Sign Up with Google
          </Button>
          <Button type="button" onClick={() => handleSocialSignUp(facebookProvider)}>
            Sign Up with Facebook
          </Button>
        </SocialButtons>

        <Links>
          <Link onClick={() => navigate('/sign-in')}>Already have an account? Sign In</Link>
        </Links>
      </Form>
    </SignUpContainer>
  );
};

export default SignUpPage;

// Styled Components
const SignUpContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Label = styled.label`
  text-align: left;
  font-weight: bold;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Error = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const Success = styled.p`
  color: green;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const SocialButtons = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`;

const Links = styled.div`
  margin-top: 1rem;
`;

const Link = styled.a`
  color: #007bff;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;
