const path = require('path');
const express = require("express");

// Firebase imports
const { initializeApp } = require('firebase/app');
const {getFirestore, doc, collection, getDocs, setDoc} = require("firebase/firestore");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsAgr3ESKxz8C7HoLop7NE_tJL8q-kN1g",
  authDomain: "facebookstatusclone.firebaseapp.com",
  projectId: "facebookstatusclone",
  storageBucket: "facebookstatusclone.appspot.com",
  messagingSenderId: "869901448183",
  appId: "1:869901448183:web:e7c71d86836c77884e74f2"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

const PORT = process.env.PORT || 3001;

const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.json());

// User login with username
app.post("/new-user", async (req, res) => {
  const username = req.body.username;
  console.log("Username: " + username);

  const usernameCollection = collection(db, "users");
  const usernameSnapshot = await getDocs(usernameCollection);
  
  // Check if username already exists
  let usernameFound = false
  usernameSnapshot.forEach(user => {
    if (user.id === username) {
      console.log("Found");
      usernameFound = true;
    }
  })

  if (usernameFound) {
    res.status(200).send({error: true});
  } else {
    // Add the new username to the database
    const usernameDoc = doc(db, "users", username)
    await setDoc(usernameDoc, {
      username: username
    });
    res.status(200).send({success: true});
  }

})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});