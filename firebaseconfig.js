import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyANRqR887AfhoW4GxInZHH9J3YYWCfnjs0",
  authDomain: "microjobs-b9d90.firebaseapp.com",
  projectId: "microjobs-b9d90",
  storageBucket: "microjobs-b9d90.firebasestorage.app",
  messagingSenderId: "1006928193385",
  appId: "1:1006928193385:web:d4b5cc1911abda6ff53ff8",
  measurementId: "G-74NJW2SE9F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
