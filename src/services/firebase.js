// Import Firebase dependencies
import firebase, { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, sendSignInLinkToEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';  
import { getFirestore, collection, addDoc, getDocs,getDoc, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PaystackPop from 'paystack'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';


// Firebase Configuration Object
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const storage = getStorage();

// Firebase Authentication
const auth = getAuth(app);
const createEscrow = firebase.functions().httpsCallable('createEscrow'); // Call the Firebase Cloud Function

async function createEscrowTransaction() {
  try {
    const productId = "product123";
    const buyerAddress = "buyerAddress123";
    const sellerAddress = "sellerAddress123";
    const amount = 100;

    // Call the Cloud Function to create the escrow on the Sui blockchain
    const result = await createEscrow({ productId, buyerAddress, sellerAddress, amount });

    if (result.data.success) {
      // Save the escrow details to Firestore
      const escrowData = {
        productId,
        buyerAddress,
        sellerAddress,
        amount,
        txHash: result.data.txHash,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Add to Firestore (escrows collection)
      await db.collection('escrows').add(escrowData);
      console.log('Escrow created and saved to Firestore:', escrowData);
    } else {
      console.error('Error creating escrow:', result.data.error);
    }
  } catch (error) {
    console.error('Error in transaction:', error);
  }
}

// Call the function (this could be triggered by a button click or other event)
createEscrowTransaction();

// Google and Facebook Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Firebase Firestore
const db = getFirestore(app);

// Paystack and secret keys from environment variables
const paystackSecretKey = process.env.REACT_APP_PAYSTACK_SECRET_KEY;

// Authentication Functions

// Sign In with Email and Password
const signInWithEmail = async (auth, email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Register with Email and Password
const signUpWithEmail = async (auth, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Send Password Reset Email
const sendResetPasswordEmail = async (auth, email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent!";
  } catch (error) {
    throw new Error(error.message);
  }
};

// Social Media Sign In (Google/Facebook)
const signInWithSocial = async (auth, provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Send Email Verification
const sendEmailVerification = async (auth, user) => {
  try {
    await sendEmailVerification(user);
    return "Verification email sent!";
  } catch (error) {
    throw new Error(error.message);
  }
};

//signup with phone 
const signUpWithPhone = async (phoneNumber, recaptchaContainer) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        recaptchaContainer,
        { size: "invisible" },
        auth
      );
  
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      throw new Error("Error signing up with phone: " + error.message);
    }
  };

// Function for sign-up with username (email)
const signUpWithUsername = async (username, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, username, password);
      return userCredential.user;
    } catch (error) {
      throw new Error("Error signing up with username: " + error.message);
    }
  };


// Firestore Functions

// Add a document (Product, message, etc.)
const addDocToCollection = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    throw new Error("Error adding document: " + error.message);
  }
};

// Get documents from a collection
const getDocuments = async (collectionName) => {
  try {
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return documents;
  } catch (error) {
    throw new Error("Error getting documents: " + error.message);
  }
};

// Get specific documents by field (e.g., by productId)
const getDocumentsByField = async (collectionName, field, value) => {
  try {
    const q = query(collection(db, collectionName), where(field, "==", value));
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return documents;
  } catch (error) {
    throw new Error("Error getting documents by field: " + error.message);
  }
};

// Update a document
const updateDocument = async (collectionName, documentId, updatedData) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, updatedData);
    return "Document updated!";
  } catch (error) {
    throw new Error("Error updating document: " + error.message);
  }
};

// Delete a document
const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return "Document deleted!";
  } catch (error) {
    throw new Error("Error deleting document: " + error.message);
  }
};

// Real-time user state change listener
const onUserStateChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Function to get products (from Firestore)
const getProducts = async () => {
    try {
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map((doc) => doc.data());
      return productsList;
    } catch (error) {
      throw new Error("Error fetching products: " + error.message);
    }
  };
  
  // Function to handle sign-in with username (implement your own logic)
  const signInWithUsername = async (username, password) => {
    try {
      // Example logic for sign-in with username and password
      // Replace this with your own logic (e.g., querying Firestore for the user)
      const user = await getDocumentsByField("users", "username", username);
      if (user && user.password === password) {
        return user; // Simulate user data
      } else {
        throw new Error("Invalid username or password.");
      }
    } catch (error) {
      throw new Error("Error signing in with username: " + error.message);
    }
  };
  
  // Function to verify phone number (using Firebase Recaptcha)
  const verifyPhoneNumber = (auth, phoneNumber, recaptchaContainer) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        recaptchaContainer,
        {
          size: "invisible", // You can make the reCAPTCHA visible if needed
        },
        auth
      );
      return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error) {
      throw new Error("Error verifying phone number: " + error.message);
    }
  };
  
  // Function to sign in with phone number (using OTP)
  const signInWithPhone = async (auth, verificationId, otp) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
    } catch (error) {
      throw new Error("Error signing in with phone: " + error.message);
    }
  };


  // CoinGecko API for fetching the NGN to SUI conversion rate
const getNgnToSuiRate = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=ngn'
      );
      return response.data.sui.ngn;
    } catch (error) {
      console.error('Error fetching NGN to SUI conversion rate:', error);
      return 0;
    }
  };
  
  // -- Paystack Payment Integration --
  export const makePaystackPayment = (amount, email, name) => {
    const handler = PaystackPop.setup({
      key: 'REACT_APP_PAYSTACK_PUBLIC_KEY',  // Replace with your Paystack public key
      email: email,
      amount: amount * 100,  // Amount in kobo (1 Naira = 100 Kobo)
      currency: 'NGN',
      first_name: name,
      last_name: '',
      ref: `tx_ref_${uuidv4()}`,
      callback: async function(response) {
        const tx_ref = response.reference;
        const transaction_id = response.transaction_id;
  
        // Verify the payment and convert NGN to SUI
        await verifyPaystackPaymentRedirect(tx_ref, transaction_id, amount);
      },
      onClose: function() {
        alert('Payment window closed!');
      },
    });
  
    handler.openIframe();
  };
  
  // Verify Paystack payment and update balance
  export const verifyPaystackPaymentRedirect = async (tx_ref, transaction_id, amountInNgn) => {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`, // Paystack Secret Key
          },
        }
      );
  
      const paymentStatus = response.data.data.status;
  
      if (paymentStatus === 'success') {
        console.log('Paystack Payment successful');
  
        // Get conversion rate from NGN to SUI
        const conversionRate = await getNgnToSuiRate();
        const suiAmount = (amountInNgn * conversionRate) / 100;  // Convert NGN to SUI (adjusted)
  
        // Update Firestore with the converted SUI amount
        updateUserBalance(suiAmount);
      } else {
        console.log('Paystack Payment failed');
      }
    } catch (error) {
      console.error('Error verifying Paystack payment:', error);
    }
  };
  
  // Update Firestore with the converted SUI balance
  const updateUserBalance = async (suiAmount) => {
    const user = auth.currentUser;
  
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        console.log('User not found');
        return;
      }
  
      // Get the current balance from Firestore (if exists)
      const currentBalance = userDoc.data().suiBalance || 0;
      const updatedBalance = currentBalance + suiAmount;
  
      // Update Firestore with the new balance
      await updateDoc(userRef, {
        suiBalance: updatedBalance,
        lastPaymentDate: new Date(),
      });
  
      console.log('User SUI balance updated to:', updatedBalance);
    }
  };
  

 
  // to upload image
  const uploadImage = async (file) => {
    try {
      const imageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      throw new Error("Error uploading image: " + error.message);
    }
  };

  //to get product
  const getProduct = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        return productDoc.data();
      } else {
        throw new Error("Product not found");
      }
    } catch (error) {
      throw new Error("Error fetching product: " + error.message);
    }
  };
  
  // delete product
  const deleteProduct = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      return "Product deleted successfully!";
    } catch (error) {
      throw new Error("Error deleting product: " + error.message);
    }
  };
  



  // Add the functions to the exports at the end of firebase.js
  export {
    auth,
    googleProvider,
    facebookProvider,
    db,
    deleteProduct,
    getProduct,
    uploadImage,
    signInWithEmail,
    signUpWithEmail,
    sendResetPasswordEmail,
    signInWithSocial,
    sendEmailVerification,
    getProducts,
    signInWithUsername,
    verifyPhoneNumber,
    signInWithPhone,
    addDocToCollection,
    getDocuments,
    getDocumentsByField,
    updateDocument,
    deleteDocument,
    onUserStateChanged,
  };