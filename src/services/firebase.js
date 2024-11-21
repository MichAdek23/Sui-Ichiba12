import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, getDoc,doc, deleteDoc, updateDoc } from "firebase/firestore";
import { 
  getAuth, 
  connectAuthEmulator, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider 
} from "firebase/auth";
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase with the config (replace with your actual config values)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to the Firebase Emulator for Firestore, Auth, and Storage
connectFirestoreEmulator(db, "localhost", 6218);  // Firestore Emulator on port 5434
connectAuthEmulator(auth, "http://localhost:5434");  // Auth Emulator on port 7979
connectStorageEmulator(storage, "localhost", 7676);  // Storage Emulator on port 7676

// Google and Facebook providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Sign in with email and password
const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Signup with email and Password
const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};


// Simulated sign in with username and password
const signInWithUsername = async (username, password) => {
  try {
    // Fetch the email associated with the username from the Firestore database
    const userDoc = await db.collection("users").where("username", "==", username).get();
    if (userDoc.empty) {
      throw new Error("User not found");
    }

    const email = userDoc.docs[0].data().email;
    return await signInWithEmail(email, password);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Verify phone number with reCAPTCHA
const verifyPhoneNumber = async (phoneNumber) => {
  const recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha-container", // Ensure you have a <div> with this ID in your app
    {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA verified");
      },
    },
    auth
  );
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

// Sign in with phone using verification code
const signInWithPhone = async (verificationId, otp) => {
  const credential = PhoneAuthProvider.credential(verificationId, otp);
  return auth.signInWithCredential(credential);
};

// Fetch products of the current user
const getProducts = async () => {
  try {
    // Get the current user's ID
    const userId = auth.currentUser.uid;

    // Create a reference to the products collection
    const productsCollection = collection(db, "products");

    // Create a query to fetch products for the current user
    const q = query(productsCollection, where("userId", "==", userId));

    // Fetch the documents
    const querySnapshot = await getDocs(q);

    // Map the documents to an array of products
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};

// Upload image to Firebase Storage
const uploadImage = async (file) => {
  const storageRef = ref(storage, `images/${file.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

// Fetch available products from the Firestore `products` collection
const getAvailableProducts = async () => {
  try {
    const productsCollection = collection(db, "products");
    const querySnapshot = await getDocs(productsCollection);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};

const updateProduct = async (productId, updatedData) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, updatedData);
    console.log("Product updated successfully");
  } catch (error) {
    throw new Error("Failed to update product: " + error.message);
  }
};

// Delete a product by its ID
const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    console.log(`Product with ID: ${productId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
};

const getSeller = async (sellerId) => {
  try {
    const sellerDocRef = doc(db, "users", sellerId);  // Assuming 'users' collection stores seller info
    const sellerDoc = await getDoc(sellerDocRef);

    if (!sellerDoc.exists()) {
      throw new Error("Seller not found");
    }

    return sellerDoc.data();  // Return the seller data
  } catch (error) {
    console.error("Error fetching seller:", error);
    throw new Error("Failed to fetch seller");
  }
};


export {
  app,
  auth,
  db,
  storage,
  googleProvider,
  facebookProvider,
  getSeller,
  uploadImage,
  getProducts,
  updateProduct,
  getAvailableProducts,
  deleteProduct,
  signUpWithEmail,
  signInWithEmail,
  signInWithUsername,
  verifyPhoneNumber,
  signInWithPhone,
};
