// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbuxTesrLPbi_8H_3NPylweLO2OUTt5EQ",
  authDomain: "fast-project-b9afc.firebaseapp.com",
  projectId: "fast-project-b9afc",
  storageBucket: "fast-project-b9afc.appspot.com",
  messagingSenderId: "805914261193",
  appId: "1:805914261193:web:0ef30543e13e299668bf18",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { auth, db, googleProvider, storage };
