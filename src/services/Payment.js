import { v4 as uuidv4 } from 'uuid';
import PaystackPop from 'paystack'; // Add this import
import axios from 'axios';

// -- Paystack Payment Integration --
const paystackSecretKey = process.env.REACT_APP_PAYSTACK_SECRET_KEY;

// Function to initiate payment with Paystack (Frontend)
export const makePaystackPayment = (amount, email, name) => {
  const handler = PaystackPop.setup({
    key: 'REACT_APP_PAYSTACK_SECRET_KEY',  // Replace with your Paystack public key
    email: email,                     // User email
    amount: amount * 100,             // Amount in kobo (100 kobo = 1 Naira)
    currency: 'NGN',                  // Currency code (NGN for Nigerian Naira)
    first_name: name,                 // First name of the user
    last_name: '',                    // Last name (optional)
    ref: `tx_ref_${uuidv4()}`,         // Unique transaction reference
    callback: function(response) {
      // Handle successful payment
      const tx_ref = response.reference;
      const transaction_id = response.transaction_id;

      // Send payment data to Firebase to verify the payment
      verifyPaystackPaymentRedirect(tx_ref, transaction_id);
    },
    onClose: function() {
      alert('Payment window closed!');
    }
  });

  handler.openIframe();
};

// Firebase Cloud Function to verify Paystack payment (Backend)
import * as functions from 'firebase-functions';

// Firebase Cloud Function to verify Paystack payment
export const verifyPaystackPayment = functions.https.onRequest(async (req, res) => {
  const { tx_ref } = req.query; // tx_ref passed after payment

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${functions.config().paystack.secret_key}`, // Store secret key securely
        },
      }
    );

    const paymentStatus = response.data.data.status;

    if (paymentStatus === 'success') {
      // Payment was successful, handle success logic (update Firestore, ship product, etc.)
      return res.status(200).send({ message: 'Payment verified successfully' });
    } else {
      // Handle payment failure
      return res.status(400).send({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).send({ message: 'Error verifying payment' });
  }
});

// Function to trigger payment verification after redirection
export const verifyPaystackPaymentRedirect = async (tx_ref, transaction_id) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${YOUR_PAYSTACK_SECRET_KEY}`, // Paystack Secret Key
        },
      }
    );

    const paymentStatus = response.data.data.status;

    if (paymentStatus === 'success') {
      console.log('Payment successful');
      // Process post-payment logic (update Firestore, ship product, etc.)
    } else {
      console.log('Payment failed');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
  }
};

