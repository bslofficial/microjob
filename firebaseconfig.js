import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// আপনার ফায়ারবেস কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyANRqR887AfhoW4GxInZHH9J3YYWCfnjs0",
  authDomain: "microjobs-b9d90.firebaseapp.com",
  projectId: "microjobs-b9d90",
  storageBucket: "microjobs-b9d90.firebasestorage.app",
  messagingSenderId: "1006928193385",
  appId: "1:1006928193385:web:d4b5cc1911abda6ff53ff8",
  measurementId: "G-74NJW2SE9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export Firestore database for use in other files
export const db = getFirestore(app);
