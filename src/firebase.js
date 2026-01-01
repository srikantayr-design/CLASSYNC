import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAv59VXRsUu8FR2C5_sXyuJPjCxF2zDhUM",
  authDomain: "classsync-66358.firebaseapp.com",
  projectId: "classsync-66358",
  storageBucket: "classsync-66358.firebasestorage.app",
  messagingSenderId: "1078531508600",
  appId: "1:1078531508600:web:e0f361357cec1e8959e08d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
