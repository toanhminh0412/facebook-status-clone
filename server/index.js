const path = require('path');
const express = require("express");
require('dotenv').config()

// Firebase imports
const { initializeApp } = require('firebase/app');
const {getFirestore, doc, collection, getDocs, setDoc, getDoc} = require("firebase/firestore");

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
  const newUser = req.body.newUser;
  console.log("Username: " + newUser.username);

  const usernameCollection = collection(db, "users");
  const usernameSnapshot = await getDocs(usernameCollection);
  
  // Check if username already exists
  let usernameFound = false
  let userData = {}
  usernameSnapshot.forEach(user => {
    if (user.id === newUser.username) {
      console.log("Found");
      usernameFound = true;
      userData = user.data();
    }
  })

  console.log(userData)

  if (usernameFound) {
    res.status(200).send({success: true, found: true, photo: userData.userPhoto});
  } else {
    // Add the new username to the database
    const usernameDoc = doc(db, "users", newUser.username)
    await setDoc(usernameDoc, newUser);
    res.status(200).send({success: true});
  }

})

app.post("/new-post", async (req, res) => {
  const newPost = req.body.newPost;
  console.log("New post: " + newPost);
  const postRef = doc(db, "posts", newPost.postId);
  try {
    await setDoc(postRef, newPost);
    res.status(200).send({success: true})
  } catch (e) {
    res.status(200).send({error: "Can't upload to firestore"})
  }
})

app.get("/all-posts", async(req, res) => {
  const postCollection = collection(db, "posts");
  const postSnapshot = await getDocs(postCollection);
  let posts = [];
  postSnapshot.forEach(doc => {
    posts.push(doc.data());
  })
  // console.log(posts)
  res.status(200).send({posts: posts.reverse()})
})

app.post("/like-post", async (req, res) => {
  const newLike = req.body.newLike;  
  const postRef = doc(db, "posts", newLike.postId);
  const postSnap = await getDoc(postRef);
  let post = {}
  if (postSnap.exists()) {
    post = postSnap.data();
  }

  // User like if the post has not been liked by the user, else user unlike
  let usernameLikeFound = false;
  let likes = []
  for (let i = 0; i < post.likes.length; i++) {
    if (post.likes[i] === newLike.username) {
      usernameLikeFound = true;
      continue;
    } else {
      likes.push(post.likes[i]);
    }
  }
  if (!usernameLikeFound) {
    likes.push(newLike.username);
  }
  post.likes = likes
  await setDoc(postRef, post);
  res.status(200).send({msg: "Like Successfully"})
})

app.post("/comment-post", async (req, res) => {
  const newComment = req.body.newComment;  
  const postRef = doc(db, "posts", newComment.postId);
  const postSnap = await getDoc(postRef);
  let post = {}
  if (postSnap.exists()) {
    post = postSnap.data();
  }
  post.comments.push(newComment);
  await setDoc(postRef, post);
  res.status(200).send({msg: "Comment Successfully"})
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});