import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyA5HBAWMNuf2EoRQLRSHw5wGIlpCQwvJQg",
  authDomain: "plotify-70bbe.firebaseapp.com",
  projectId: "plotify-70bbe",
  storageBucket: "plotify-70bbe.firebasestorage.app",
  messagingSenderId: "520370095307",
  appId: "1:520370095307:web:ebea6d0cc7156cb808c74e",
  measurementId: "G-903DDMB2NV"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app); // Add authentication initialization

// Initialize Analytics only in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export the Firestore database, Auth, and Firebase config
export { db, auth, firebaseConfig };
