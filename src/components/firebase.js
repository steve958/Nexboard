import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRLe0_FOBM_CzYygERU8J9wj53A4gBusI",
  authDomain: "nexboard-99194.firebaseapp.com",
  projectId: "nexboard-99194",
  storageBucket: "nexboard-99194.appspot.com",
  messagingSenderId: "556054766353",
  appId: "1:556054766353:web:9a53974ac4a2d0cc6fe2b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);