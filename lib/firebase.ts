import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-9TsCexHEzR5iN9R2VhgCY61JmqDINgc",
  authDomain: "echo-9ac26.firebaseapp.com",
  projectId: "echo-9ac26",
  storageBucket: "echo-9ac26.firebasestorage.app",
  messagingSenderId: "541299624284",
  appId: "1:541299624284:web:7410e2aaf9665147cb9999"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
