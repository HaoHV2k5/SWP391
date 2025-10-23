// Firebase configuration
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

// Firebase config - Config chính xác từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBe9o0375J6R3oGFZNy2aY3mABkgde1j-k",
  authDomain: "swp391-3fa40.firebaseapp.com",
  projectId: "swp391-3fa40",
  storageBucket: "swp391-3fa40.firebasestorage.app",
  messagingSenderId: "307912613047",
  appId: "1:307912613047:web:eb57fdd4f5cd3dec3a4132",
  measurementId: "G-B568VV3JQF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.addScope("email");
googleProvider.addScope("profile");

facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");

export default { auth, googleProvider, facebookProvider };
