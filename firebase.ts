import { initializeApp } from "firebase/app";
import {
    initializeFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    CollectionReference,
    DocumentData
} from "firebase/firestore"

import { getStorage } from "firebase/storage";

import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAgHW1lDVPqnQrkY7DF6YpzS819WrH_CsU",
  authDomain: "fir-pbp-37e6c.firebaseapp.com",
  projectId: "fir-pbp-37e6c",
  storageBucket: "fir-pbp-37e6c.firebasestorage.app",
  messagingSenderId: "21069408582",
  appId: "1:21069408582:web:a1bfcbb7e2bb1bbe40dd47",
  measurementId: "G-LZJ8ER3CEM"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
const storage = getStorage(app);

export const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;
export {auth,db,collection,addDoc,serverTimestamp,query,orderBy,onSnapshot,signInAnonymously,onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, storage};