import React, { useContext, useEffect, useState } from "react";
import "./profile.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";

const Profile = () => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImg, setPrevImg] = useState("");
  const {setUserData} = useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setPrevImg(data.avatar || "");
        }
      } else {
        navigate("/");
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate, auth]);
  

  const profileUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "users", uid);
  
      if (image) {
        // Upload image and get the URL
        const imgUrl = await upload(image);
        await updateDoc(docRef, { avatar: imgUrl, bio: bio, name: name });
      } else {
        await updateDoc(docRef, { bio: bio, name: name });
      }
      const snap = await getDoc(docRef)
      setUserData(snap.data())
      navigate('/chat')
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };
  
  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
            />
            Uploud profile image
          </label>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Your Name"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          ></textarea>
          <button type="submit">Save</button>
        </form>
        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) : prevImg? prevImg : assets.logo_icon}
        />
      </div>
    </div>
  );
};

export default Profile;
