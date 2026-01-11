// src/app/contexts/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARE2_6sPeRDwXmmxfWKFkqJujwZquV8yM",
  authDomain: "projet-x-2fdb7.firebaseapp.com",
  projectId: "projet-x-2fdb7",
  storageBucket: "projet-x-2fdb7.firebasestorage.app",
  messagingSenderId: "763602766404",
  appId: "1:763602766404:web:5428d69f0998399b9b4a11",
  measurementId: "G-P9LPZZK9D2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);        // ✅ Export Firebase Auth
export const analytics = getAnalytics(app); // Optional, if you still use analytics