import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore client SDK
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const DepositPage = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [suiWalletAddress, setSuiWalletAddress] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); // Initialize Firestore instance

  // Initialize Sui Client for blockchain interactions
  const client = new SuiClient({ url: getFullnodeUrl('devnet') });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadUserData(user.uid); // Load user-specific data (like wallet address)
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Load user data from Firestore, including the SUI wallet address
  const loadUserData = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setSuiWalletAddress(userData.suiWalletAddress); // Assuming the wallet address is stored in Firestore
    } else {
      setError('User data not found.');
    }
  };

  // Convert NGN to SUI
  const convertToSui = async (amount, currency) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=${currency.toLowerCase()}`);
      const data = await response.json();

      if (data.sui && data.sui[currency.toLowerCase()]) {
        const suiAmount = amount / data.sui[currency.toLowerCase()];
        setConvertedAmount(suiAmount);
      } else {
        throw new Error('Error fetching conversion rate.');
      }
    } catch (error) {
      setConvertedAmount(0);
      setError('Unable to convert to SUI at this time. Please try again later.');
    }
  };

  // Function to withdraw SUI coins from user's SUI wallet to the Firestore balance
  const withdrawFromSuiWallet = async (amount) => {
    try {
      if (!suiWalletAddress) {
        setError('SUI Wallet address is missing.');
        return false;
      }

      const senderWallet = await client.wallet.getAccount(userId);

      // Assuming you have a method to transfer SUI from wallet to user account:
      const transaction = await client.transactions.sendTransaction(senderWallet, suiWalletAddress, amount);
      
      console.log('SUI Withdrawal Transaction successful:', transaction);
      return true;
    } catch (error) {
      console.error('Error withdrawing SUI from wallet:', error);
      setError('Error during withdrawal. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await convertToSui(amount, currency);  // Convert amount to SUI

      // Withdraw SUI from the wallet to user's account
      const withdrawalSuccessful = await withdrawFromSuiWallet(convertedAmount);

      if (withdrawalSuccessful) {
        // Update user balance in Firestore
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const user = userDoc.data();
          const newBalance = user.balance + convertedAmount;

          // Update Firestore with new balance
          await updateDoc(userRef, {
            balance: newBalance,
          });

          setLoading(false);
          navigate('/dashboard');
        } else {
          setError('User not found in Firestore.');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message || 'Withdrawal failed. Please try again.');
    }
  };

  return (
    <DepositContainer>
      <h2>Deposit Funds to Dashboard from SUI Wallet</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="amount">Amount (in NGN):</label>
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
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {convertedAmount > 0 && (
        <p>Converted Amount: {convertedAmount} SUI</p>
      )}
    </DepositContainer>
  );
};

const DepositContainer = styled.div`
  padding: 20px;
  background: #f4f4f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  margin: 50px auto;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 20px;
`;

export default DepositPage;
