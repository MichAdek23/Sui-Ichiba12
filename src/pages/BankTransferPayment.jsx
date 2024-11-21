import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getUserByUID } from '../services/firebase'; // Import Firebase functions
import { generateBankAccount } from '../services/Payment';

const BankTransferPayment = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = 'user-uid'; // Retrieve from context or Firebase authentication

  const handleGenerateBankAccount = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call the backend to generate bank account details
      const response = await fetch('/api/generate-bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, userId })
      });
      
      const data = await response.json();

      if (response.ok && data.bankAccountDetails) {
        setBankDetails(data.bankAccountDetails);
      } else {
        setError('Failed to generate bank account details');
      }
    } catch (error) {
      setError('Error generating bank account details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BankTransferContainer>
      <h2>Bank Transfer Payment</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="amount">Amount:</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label htmlFor="currency">Currency:</label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        >
          <option value="NGN">NGN</option>
          <option value="USD">USD</option>
        </select>

        <button type="button" onClick={handleGenerateBankAccount} disabled={loading}>
          {loading ? 'Generating Account...' : 'Generate Bank Account'}
        </button>
      </form>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {bankDetails && (
        <BankDetails>
          <h3>Bank Account Details:</h3>
          <p>Account Name: {bankDetails.accountName}</p>
          <p>Account Number: {bankDetails.accountNumber}</p>
          <p>Bank: {bankDetails.bankName}</p>
          <p>Sort Code: {bankDetails.sortCode}</p>
          <p>Please transfer the amount to the above details.</p>
        </BankDetails>
      )}
    </BankTransferContainer>
  );
};

export default BankTransferPayment;

// Styled Components for UI

const BankTransferContainer = styled.div`
  padding: 20px;
  background: #f4f4f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  margin: 50px auto;
`;

const BankDetails = styled.div`
  margin-top: 20px;
  padding: 10px;
  background: #e0f7fa;
  border-radius: 8px;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 20px;
`;
