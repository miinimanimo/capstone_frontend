// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzuc3nQWLmMrZDsfB_G8O77QQXjAtGiRM",
  authDomain: "capstone-e8367.firebaseapp.com",
  projectId: "capstone-e8367",
  storageBucket: "capstone-e8367.firebasestorage.app",
  messagingSenderId: "882274472919",
  appId: "1:882274472919:web:6ac9ee1e5573609f12b192",
  measurementId: "G-MLFY70J941"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);