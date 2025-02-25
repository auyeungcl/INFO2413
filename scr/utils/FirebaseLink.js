//Firebase
import firebase from "firebase/compat/app";
import { getFirestore } from "@firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6yZmPxbmgIjah6jhqUQ_SbjE4WZ43INs",
  authDomain: "info2413-t3.firebaseapp.com",
  projectId: "info2413-t3",
  storageBucket: "info2413-t3.appspot.com",
  messagingSenderId: "684939785970",
  appId: "1:684939785970:web:7d016d347f2af60873826b",
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
