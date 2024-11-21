import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { updatePassword } from "firebase/auth"; // Import the Firebase Auth method
import { auth } from "../services/firebase"; // Your Firebase Auth instance
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

// Styled Components
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

const Switch = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const SettingsPage = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate(); // Using useNavigate instead of useHistory

  // Check if Dark Mode is enabled on page load
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!password || !newPassword) {
      setMessage("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setMessage("Password updated successfully.");
      } else {
        setMessage("No user logged in.");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  // Example of navigation after successful password change
  const navigateToDashboard = () => {
    navigate("/dashboard"); // Change to your desired route
  };

  return (
    <Container>
      <Title>Settings</Title>
      <Form onSubmit={handlePasswordChange}>
        <FormGroup>
          <Label>Current Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </FormGroup>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </Form>
      
      <FormGroup>
        <Label>Theme Preferences</Label>
        <Switch>
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeToggle}
          />
        </Switch>
      </FormGroup>

      {message && <Message error={message.startsWith("Error")}>{message}</Message>}

      {/* Optionally, after updating password, you can navigate somewhere */}
      <Button onClick={navigateToDashboard}>Go to Dashboard</Button>
    </Container>
  );
};

export default SettingsPage;
