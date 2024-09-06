import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import { toast } from "react-toastify";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCWkaJLTNoW84V3ow07tpoWu8sPHcaNP3o",
  authDomain: "chat-app-2e042.firebaseapp.com",
  projectId: "chat-app-2e042",
  storageBucket: "chat-app-2e042.appspot.com",
  messagingSenderId: "637058819225",
  appId: "1:637058819225:web:e46769c7b3c9a6a1f10408"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup function
export const signup = async (username, email, password) => {
  try {
    // Create user with email and password
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Set user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, I am using Ali's Chat app",
      lastSeen: Date.now()
    });


    // Initialize user chats
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });

    toast.success("User signed up successfully!");
  } catch (error) {
    console.error("Signup error:", error.message); 
    toast.error(`Signup failed: ${error.message}`); 
  }
};
export  const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email")
    return null
  }
  try {
    const userRef = collection(db, 'users')
    const q = query(userRef,where("email", "==" , email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent successfully!");
    }
    else{
      toast.error("No user found with this email");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message)
  }
} 
export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("User logged in successfully!");
  } catch (error) {
    toast.error(`Login failed: ${error.message}`); 
  }
};
export const logout = async () => {
  try {
    await signOut(auth)
    toast.success("User signed out successfully!");
  } catch (error) {
    toast.error(`sign out failed: ${error.message}`); 
  }
}
export {auth , db}