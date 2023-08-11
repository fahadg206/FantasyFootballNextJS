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
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLCVmOdpdjWZOHgcvUDsS37udjRrvXNwg",
  authDomain: "fantasypulse-3523b.firebaseapp.com",
  projectId: "fantasypulse-3523b",
  storageBucket: "fantasypulse-3523b.appspot.com",
  messagingSenderId: "537780473762",
  appId: "1:537780473762:web:80cb568792997aa615ecfb",
  measurementId: "G-B885Y5X02R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
