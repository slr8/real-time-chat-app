import React, { useContext, useEffect, useState } from "react";
import "./chatbox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } =
    useContext(AppContext);
  const [input, setInput] = useState("");
console.log(chatUser);

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  const converTime = (time) => {
    let date = time.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    } else {
      return hour + ":" + minute + "AM";
    }
  };

  const sendImg = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            Image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rid, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshots = await getDoc(userChatsRef);

          if (userChatsSnapshots.exists()) {
            const userChatData = userChatsSnapshots.data();
            const chatIndex = userChatData.chatsData?.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = "image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rid === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });
        const userIDs = [chatUser.rid, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshots = await getDoc(userChatsRef);

          console.log(userChatsSnapshots.data());

          if (userChatsSnapshots.exists()) {
            const userChatData = userChatsSnapshots.data();
            const chatIndex = userChatData.chatsData?.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rid === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  };

  return chatUser ? (
    <div className={`chat-box ${chatVisible? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.user.avatar} />
        <p className="dot">
          {chatUser?.user.name}
          {Date.now()-chatUser.user.lastSeen <= 70000? <img className="dot" src={assets.green_dot} /> : null} 
        </p>
        <img src={assets.help_icon} className="help" />
        <img onClick={(()=> setChatVisible(false))} src={assets.arrow_icon} className="arrow" />
      </div>
      <div className="chat-msg">
        <div className="chat-msg">
          {messages.map((msg, key) => (
            <div
              key={key}
              className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            >
              {msg.Image? (
                <img className="msg-img" src={msg.Image} alt="" />
              ) : (
                <p className="msg">{msg.text}</p>
              )}
              <div>
                <img
                  src={
                    msg.sId === userData.id
                      ? userData.avatar
                      : chatUser.user.avatar
                  }
                  alt="User Avatar"
                />
                <p>{converTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message..."
        />
        <input
          onChange={sendImg}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
