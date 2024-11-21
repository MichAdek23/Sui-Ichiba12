import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore client SDK
import { makePaystackPayment as createPaystackPayment, verifyPaystackPaymentRedirect as processSuccessfulPayment,} from '../services/Payment';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { updateUserBalance } from '../services/firebase';

const DepositPage = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); // Initialize Firestore instance

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Initialize Sui Client for blockchain interactions
  const client = new SuiClient({ url: getFullnodeUrl('devnet') });

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

  useEffect(() => {
    const loadPaystackScript = () => {
      return new Promise((resolve) => {
        if (window.PaystackPop) {
          resolve();
        } else {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.async = true;
          script.onload = resolve;
          document.body.appendChild(script);
        }
      });
    };

    loadPaystackScript();
  }, []);

  // Handle form submission for deposit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await convertToSui(amount, currency);

      if (paymentMethod === 'card') {
        try {
          const paymentData = await createPaystackPayment(amount, currency);

          const paystack = window.PaystackPop;
          if (!paystack) {
            throw new Error('Paystack script is not loaded');
          }

          const paystackTransaction = paystack.newTransaction(paymentData);

          paystackTransaction.on('paymentSuccess', async (response) => {
            const reference = response.reference;

            // Process payment success and update user balance
            await processSuccessfulPayment(reference, amount, currency);

            const userRef = doc(db, 'users', userId); // Firestore reference
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
              setLoading(false);
              setError('User not found');
              return;
            }

            const user = userDoc.data();
            const newBalance = user.balance + convertedAmount;

            // Update Firestore with new balance
            await updateDoc(userRef, {
              balance: newBalance,
            });

            // Send converted SUI coins to SUI-ICHIBA
            await depositToSuiIchiba(userId, convertedAmount);

            setLoading(false);
            navigate('/dashboard');
          });

          paystackTransaction.on('paymentCanceled', () => {
            setLoading(false);
            setError('Payment was canceled. Please try again.');
          });
        } catch (error) {
          setLoading(false);
          setError(error.message || 'Deposit failed. Please try again.');
        }
      }
    } catch (error) {
      setLoading(false);
      setError(error.message || 'Deposit failed. Please try again.');
    }
  };

  // Function to send SUI coins to SUI-ICHIBA
  const depositToSuiIchiba = async (userId, amount) => {
    try {
      // Assuming we have a SUI wallet and contract to deposit to SUI-ICHIBA
      const recipientWalletAddress = 'SUI-ICHIBA-WALLET-ADDRESS'; // Replace with actual address
      const senderWallet = await client.wallet.getAccount(userId);

      // Sending transaction to SUI-ICHIBA wallet
      const transaction = await client.transactions.sendTransaction(senderWallet, recipientWalletAddress, amount);

      console.log('SUI Deposit Transaction successful:', transaction);
    } catch (error) {
      console.error('Error depositing SUI to SUI-ICHIBA:', error);
    }
  };

  return (
    <DepositContainer>
      <h2>Deposit Funds to SUI-ICHIBA</h2>
      <form onSubmit={handleSubmit}>
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
        </select>

        <label htmlFor="payment-method">Payment Method:</label>
        <select
          id="payment-method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
        >
          <option value="card">Card</option>
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
