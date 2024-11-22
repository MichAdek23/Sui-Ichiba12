import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, query, where, getDocs, getDoc,doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword,createUserWithEmailAndPassword,RecaptchaVerifier, signInWithPhoneNumber,  PhoneAuthProvider } from "firebase/auth";
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// Initialize Firebase with the config (replace with your actual config values)
const firebaseConfig = {
  apiKey: "AIzaSyAZdm3ENCGbPmqlmmhRMT4dmkgjFgCMRJ4",
  authDomain: "ichiba-29719.firebaseapp.com",
  projectId: "ichiba-29719",
  storageBucket: "ichiba-29719.firebasestorage.app",
  messagingSenderId: "167135427620",
  appId: "1:167135427620:web:68fb87ec98504cfa192cb1",
  measurementId: "G-72QJ2KFLWK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);


// Connect to the Firebase Emulator for Firestore, Auth, and Storage
connectFirestoreEmulator(db, "localhost", 6218);  // Firestore Emulator on port 5434
connectAuthEmulator(auth, "http://localhost:5434");  // Auth Emulator on port 7979
connectStorageEmulator(storage, "localhost", 7676);  



// Ensure persistence across sessions
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistence set to local. User session will remain active until explicitly logged out.');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });



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
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return productsList;
  } catch (error) {
    throw new Error("Failed to fetch products: " + error.message);
  }
};

const getProductsByCategory = async (category) => {
  const productsCollection = collection(db, "products");
  const q = query(productsCollection, where("category", "==", category));  // Example query filtering by category

  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return products;
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

// Function to generate a unique ID with SIch prefix
const generateSIchUUID = () => {
  const uniqueID = uuidv4(); // Generate a UUID
  return `SIch-${uniqueID}`;
};

// Function to assign SIch UUID to a user in Firestore
export const assignSIchUUID = async (userId) => {
  if (!userId) return; // Ensure userId exists

  const userRef = doc(db, "users", userId);

  try {
    // Check if the user already has a SIch number
    const userDoc = await getDoc(userRef);
    if (userDoc.exists() && userDoc.data().sichNumber) {
      console.log(`User ${userId} already has a SIch Number: ${userDoc.data().sichNumber}`);
      return; // Skip assigning if already exists
    }

    // Generate a new SIch UUID
    const sichNumber = generateSIchUUID();

    // Update Firestore document with the generated number
    await updateDoc(userRef, { sichNumber });

    console.log(`SIch Number ${sichNumber} assigned to user ${userId}`);
  } catch (error) {
    console.error("Error assigning SIch UUID:", error);
  }
};


export {
  app,
  auth,
  db,
  storage,
  googleProvider,
  facebookProvider,
  getProductsByCategory,
  getSeller,
  uploadImage,
  updateProduct,
  getAvailableProducts,
  deleteProduct,
  signUpWithEmail,
  signInWithEmail,
  signInWithUsername,
  verifyPhoneNumber,
  signInWithPhone,
};
