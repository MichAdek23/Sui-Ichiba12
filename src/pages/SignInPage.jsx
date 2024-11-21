import React, { useState } from "react";
import styled from "styled-components";
import {
  auth,
  googleProvider,
  facebookProvider,
  signInWithEmail,
  signInWithPhone,
  signInWithUsername,
  verifyPhoneNumber,
} from "../services/firebase";
import { signInWithPopup, sendSignInLinkToEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    phone: "",
    otp: "",
  });
  const [mode, setMode] = useState("email"); // Options: email, username, phone, passwordless
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      switch (mode) {
        case "email":
          await signInWithEmail(auth, formData.email, formData.password);
          break;
        case "username":
          await signInWithUsername(formData.username, formData.password);
          break;
        case "phone":
          if (!otpSent) {
            await verifyPhoneNumber(formData.phone);
            setOtpSent(true);
            setSuccess("OTP sent to your phone.");
            return;
          } else {
            await signInWithPhone(formData.phone, formData.otp);
          }
          break;
        case "passwordless":
          const actionCodeSettings = {
            url: "https://your-app-url.com/dashboard",
            handleCodeInApp: true,
          };
          await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
          setSuccess("Sign-in link sent to your email.");
          return;
        default:
          throw new Error("Invalid sign-in mode.");
      }
      navigate("/dashboard");
      setSuccess("Sign-in successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
      setSuccess("Social sign-in successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  const renderInputs = () => {
    switch (mode) {
      case "email":
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
      case "username":
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
      case "phone":
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
      case "passwordless":
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
    <SignInContainer>
      <Form onSubmit={handleSignIn}>
        <h2>Sign In</h2>

        {renderInputs()}

        {error && <Error>{error}</Error>}
        {success && <Success>{success}</Success>}

        <Button type="submit">
          {otpSent && mode === "phone" ? "Verify OTP" : "Sign In"}
        </Button>

        <ModeToggle>
          {["email", "username", "phone", "passwordless"].map((option) => (
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
          <Button
            type="button"
            onClick={() => handleSocialSignIn(googleProvider)}
          >
            Sign In with Google
          </Button>
          <Button
            type="button"
            onClick={() => handleSocialSignIn(facebookProvider)}
          >
            Sign In with Facebook
          </Button>
        </SocialButtons>

        <Links>
          <Link onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </Link>
          <Link onClick={() => navigate("/sign-up")}>
            Don't have an account? Sign Up
          </Link>
        </Links>
      </Form>
    </SignInContainer>
  );
};

export default SignInPage;

// Styled Components

const SignInContainer = styled.div`
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
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${(props) => (props.isActive ? "#0056b3" : "#007bff")};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Links = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const Link = styled.span`
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-weight: bold;
  font-size: 0.875rem;

  &:hover {
    text-decoration: none;
  }
`;

const Error = styled.p`
  color: #e74c3c;
  margin-bottom: 1rem;
`;

const Success = styled.p`
  color: #2ecc71;
  margin-bottom: 1rem;
`;
