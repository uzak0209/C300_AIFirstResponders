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

const firebaseConfig1 = {
  apiKey: "AIzaSyBAN4S6BGGwvFIfRq4-8V9sCN509xy-xgg",
  authDomain: "aedlocsdb.firebaseapp.com",
  projectId: "aedlocsdb",
  storageBucket: "aedlocsdb.appspot.com",
  messagingSenderId: "773813030827",
  appId: "1:773813030827:web:7277a773a026daf908ccee"
};

const firebaseConfig2 = {
  apiKey: "AIzaSyAdVn3aArXLf695qRBFadKlPH9s8mK-pec",
  authDomain: "sosrequestdb.firebaseapp.com",
  databaseURL: "https://sosrequestdb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sosrequestdb",
  storageBucket: "sosrequestdb.appspot.com",
  messagingSenderId: "132193035117",
  appId: "1:132193035117:web:594446fee3732aa007b064"
};
// Initialize Firebase auth
export const FIREBASE_APP = initializeApp(firebaseConfig, "login");
// export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

//AED & SOSDB
export const FIREBASE_AED = initializeApp(firebaseConfig1, "aed");
export const AED_DB = getFirestore(FIREBASE_AED);
export const FIREBASE_SOS = initializeApp(firebaseConfig2, "request");
export const SOS_DB = getFirestore(FIREBASE_SOS);