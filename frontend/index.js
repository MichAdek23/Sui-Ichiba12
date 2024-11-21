/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Get Paystack secret key from environment config
const PAYSTACK_SECRET_KEY = functions.config().paystack.secret;

exports.createPayment = functions.https.onRequest(async (req, res) => {
  const { amount, currency, userEmail } = req.body;

  if (!amount || !currency || !userEmail) {
    return res.status(400).send('Missing required parameters');
  }

  try {
    const paymentData = {
      email: userEmail,
      amount: amount * 100, // Amount in kobo
      currency: currency,
      callback_url: 'https://your-website.com/payment-callback', // Update this to your callback URL
    };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (data.status === 'success') {
      res.status(200).json({ status: 'success', paymentData: data.data });
    } else {
      res.status(500).json({ status: 'error', message: data.message });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
