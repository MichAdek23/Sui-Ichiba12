import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider, signUpWithEmail, signUpWithPhone, signUpWithUsername } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, sendSignInLinkToEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    phone: '',
    otp: '',
  });
  const [mode, setMode] = useState('email'); // Options: email, username, phone, passwordless
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      switch (mode) {
        case 'email':
          await createUserWithEmailAndPassword(auth, formData.email, formData.password);
          break;
        case 'username':
          await signUpWithUsername(formData.username, formData.password);
          break;
        case 'phone':
          if (!otpSent) {
            await signUpWithPhone(formData.phone);
            setOtpSent(true);
            setSuccess('OTP sent to your phone.');
            return;
          } else {
            await signUpWithPhone(formData.phone, formData.otp);
          }
          break;
        case 'passwordless':
          const actionCodeSettings = {
            url: 'https://your-app-url.com/dashboard',
            handleCodeInApp: true,
          };
          await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
          setSuccess('Sign-up link sent to your email.');
          return;
        default:
          throw new Error('Invalid sign-up mode.');
      }
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

  const renderInputs = () => {
    switch (mode) {
      case 'email':
        return (
          <>
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
          </>
        );
      case 'username':
        return (
          <>
            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
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
          </>
        );
      case 'phone':
        return (
          <>
            <Label>Phone</Label>
            <Input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
            />
            {otpSent && (
              <>
                <Label>OTP</Label>
                <Input
                  type="text"
                  name="otp"
                  placeholder="Enter the OTP"
                  value={formData.otp}
                  onChange={handleInputChange}
                />
              </>
            )}
          </>
        );
      case 'passwordless':
        return (
          <>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SignUpContainer>
      <Form onSubmit={handleSignUp}>
        <h2>Sign Up</h2>
        {renderInputs()}
        {error && <Error>{error}</Error>}
        {success && <Success>{success}</Success>}
        <Button type="submit">
          {otpSent && mode === 'phone' ? 'Verify OTP' : 'Sign Up'}
        </Button>

        <ModeToggle>
          {['email', 'username', 'phone', 'passwordless'].map((option) => (
            <Button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              isActive={mode === option}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </ModeToggle>

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

const ModeToggle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
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
