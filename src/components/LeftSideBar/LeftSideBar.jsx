import React, { useContext, useState } from "react";
import "./leftsidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible
  } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Add state for input value

  const setChat = async (e) => {
    try {
      setMessagesId(e.messageId);
      setChatUser(e);
      const userChatsRef = doc(db,"chats" , userData.id)
      const userChatsSnapshots = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshots.data()
      const chatIndex = userChatsData.chatsData?.findIndex((c) => c.messageId === e.messageId);
      userChatsData.chatsData[chatIndex].messageSeen = true
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData
      })
      setChatVisible(true); 
    } catch (error) {
      toast.error(error.message)
    }
  };

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      setInputValue(input); // Update input value state
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExists = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExists = true;
            }
          });
          if (!userExists) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.error("Error searching for user:", error);
    }
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      // Clear the input field and hide search results after adding chat
      setInputValue("");
      setShowSearch(false);
      setUser(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={`ls ${chatVisible? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} />
          <input
            value={inputValue} // Bind input value state to the input field
            onChange={inputHandler}
            type="text"
            placeholder="Search here..."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} />
            <p>{user.username}</p>
          </div>
        ) : (
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
            >
              <img src={item.user?.avatar} />
              <div>
                <p className="dot">
                  {item.user?.name}
                  {Date.now() - item?.user?.lastSeen <= 70000 ? 
                    <img className="dot" src={assets.green_dot} />
                   : null}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSideBar;
