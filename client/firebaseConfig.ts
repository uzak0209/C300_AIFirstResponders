import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0Lw8UmscGmYYcepk424tCjf6E6VHuRSA",
  authDomain: "aifirstresponders.firebaseapp.com",
  projectId: "aifirstresponders",
  storageBucket: "aifirstresponders.appspot.com",
  messagingSenderId: "911789495207",
  appId: "1:911789495207:web:8a2cd5f91a12fef779dc82",
  measurementId: "G-P2H2B1E3EW",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
// export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
