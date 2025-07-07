import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxPJWE6umHIYKW0qZ_8y8MLDLPm_zXbPQ",
  authDomain: "agrisense-54aa5.firebaseapp.com",
  projectId: "agrisense-54aa5",
  storageBucket: "agrisense-54aa5.appspot.com",
  messagingSenderId: "435845957556",
  appId: "1:435845957556:web:a43cf0f3e625b15ad314e1",
  measurementId: "G-ZJWEK4T57K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, provider, db, storage }; 