import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

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

//AED & SOSDB
export const FIREBASE_AED = initializeApp(firebaseConfig1, "aed");
export const AED_DB = getFirestore(FIREBASE_AED);
export const FIREBASE_SOS = initializeApp(firebaseConfig2, "request");
export const SOS_DB = getFirestore(FIREBASE_SOS);
export const SOS_Storage = getStorage(FIREBASE_SOS);