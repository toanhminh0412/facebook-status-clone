import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'

import AuthPage from './components/AuthPage';
import MainPage from './components/MainPage';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage} from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "facebookstatusclone.firebaseapp.com",
  projectId: "facebookstatusclone",
  storageBucket: "facebookstatusclone.appspot.com",
  messagingSenderId: "869901448183",
  appId: "1:869901448183:web:e7c71d86836c77884e74f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Create a root reference
export const storage = getStorage();

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage/>}></Route>
        <Route exact path="/" element={<MainPage></MainPage>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
