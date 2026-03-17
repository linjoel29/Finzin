import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "./config";

export const createUserProfile = async (userId, data) => {
  await setDoc(doc(db, "users", userId), {
    ...data,
    wallet: 500.0,
    savings: 0.0,
    createdAt: new Date()
  });
};

export const getUserProfile = async (userId) => {
  const docSnap = await getDoc(doc(db, "users", userId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const addTransaction = async (userId, transaction) => {
  const ref = collection(db, "users", userId, "transactions");
  await addDoc(ref, {
    ...transaction,
    date: new Date().toISOString()
  });
};

export const getTransactions = async (userId) => {
  const ref = collection(db, "users", userId, "transactions");
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
