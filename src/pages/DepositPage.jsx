import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

const DepositPage = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [suiWalletAddress, setSuiWalletAddress] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const client = new SuiClient({ url: getFullnodeUrl('devnet') });

  // Memoize the loadUserData function to prevent re-creation
  const loadUserData = useCallback(
    async (userId) => {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSuiWalletAddress(userData.suiWalletAddress);
        } else {
          setError('User data not found.');
        }
      } catch (error) {
        setError('Error loading user data.');
      }
    },
    [db] // Dependency: db from Firestore
  );

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadUserData(user.uid);
      } else {
        navigate('/sign-in');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate, loadUserData]);

  const depositToSuiWallet = async (amount) => {
    try {
      if (!suiWalletAddress) {
        setError('SUI Wallet address is missing.');
        return false;
      }

      const senderWallet = await client.wallet.getAccount(userId);
      const transaction = await client.transactions.sendTransaction(
        senderWallet,
        suiWalletAddress,
        amount
      );

      console.log('SUI Deposit Transaction successful:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error depositing SUI to wallet:', error);
      setError('Error during deposit. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const transaction = await depositToSuiWallet(amount);

      if (transaction) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const user = userDoc.data();
          const newBalance = user.balance + parseFloat(amount);

          await updateDoc(userRef, { balance: newBalance });

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
      setError(error.message || 'Deposit failed. Please try again.');
    }
  };

  return (
    <DepositContainer>
      <h2>Deposit SUI to Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="amount">Amount (in SUI):</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
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
