import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDMawrUlO0kmYTllxuYG3AP_OF-8pjlyL4",
  authDomain: "finzin-4d511.firebaseapp.com",
  projectId: "finzin-4d511",
  storageBucket: "finzin-4d511.firebasestorage.app",
  messagingSenderId: "183449079731",
  appId: "1:183449079731:web:11887e58a8140a79b905c6",
  measurementId: "G-K2H0041CYL",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
