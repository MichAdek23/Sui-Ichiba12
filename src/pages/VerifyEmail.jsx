import React, { useState } from "react";
import { auth } from "../services/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const VerifyEmail = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    const user = auth.currentUser;

    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        setSuccess("Verification email resent! Please check your inbox.");
      } else {
        setError("Your email is already verified. You can proceed to login.");
      }
    } catch (err) {
      setError("Failed to resend verification email. Please try again.");
    }
  };

  const handleLogin = () => {
    navigate("/sign-in"); // Redirect to login if user wants to log in
  };

  return (
    <Wrapper>
      <Container>
        <Title>Email Verification</Title>
        {error && <MessageError>{error}</MessageError>}
        {success && <MessageSuccess>{success}</MessageSuccess>}
        <Text>
          We have sent a verification email to your inbox. Please click the
          link to verify your account.
        </Text>
        <Button onClick={handleResendVerification}>Resend Verification Email</Button>
        <Button onClick={handleLogin}>Go to Login</Button>
      </Container>
    </Wrapper>
  );
};

export default VerifyEmail;

// Styled Components

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
  margin: 0;
`;

const Container = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;

const MessageError = styled.p`
  color: red;
  font-size: 16px;
  margin-bottom: 10px;
`;

const MessageSuccess = styled.p`
  color: green;
  font-size: 16px;
  margin-bottom: 10px;
`;

const Text = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px;
  width: 100%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

