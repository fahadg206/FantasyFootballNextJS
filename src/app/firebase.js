// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU93F1WC8fGhWQvJw-pbvWNjhZ4BgZ9e4",
  authDomain: "langchain-test-11b7e.firebaseapp.com",
  projectId: "langchain-test-11b7e",
  storageBucket: "langchain-test-11b7e.appspot.com",
  messagingSenderId: "309081792912",
  appId: "1:309081792912:web:75e9f6e0766e87fb371315",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
