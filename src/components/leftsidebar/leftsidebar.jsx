import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import "./leftsidebar.css";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, logOut } from "../../config/firebase";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/appcontext";
import { toast } from "react-toastify";

export function LeftSidebar() {
  const navigate = useNavigate();

  const {
    userData,
    chatData,
    setChatUser,
    setMessagesId,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // 🔍 SEARCH USERS
  const inputHandler = async (e) => {
    try {
      const input = e.target.value.toLowerCase().trim();
      setSearch(input);

      if (!input) {
        setUsers([]);
        return;
      }

      const userRef = collection(db, "users");
      const querySnap = await getDocs(userRef);

    const existingChatIds = new Set(
  Array.isArray(chatData) ? chatData.map((item) => item.rId) : []
);

      const results = querySnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (user) =>
            user.id !== userData.id &&
            !existingChatIds.has(user.id) &&
            user.name.toLowerCase().includes(input)
        );

      setUsers(results);
    } catch (error) {
      console.log(error.message);
    }
  };

  // 💬 ADD OR OPEN CHAT
  const addChat = async (user) => {
    try {
      let existingChat = chatData?.find((c) => c.rId === user.id);
      let messageId;

      if (existingChat) {
        messageId = existingChat.messageId;
      } else {
        const messagesRef = collection(db, "messages");
        const newMessageRef = doc(messagesRef);

        messageId = newMessageRef.id;

        await setDoc(newMessageRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });

        const chatObjectForUser = {
          messageId,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
          userData: user,
        };

        const chatObjectForReceiver = {
          messageId,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        };

        await updateDoc(doc(db, "chats", userData.id), {
          chatsData: arrayUnion(chatObjectForUser),
        });

        await updateDoc(doc(db, "chats", user.id), {
          chatsData: arrayUnion(chatObjectForReceiver),
        });
      }

      // 🔥 OPEN CHAT IMMEDIATELY
      setMessagesId(messageId);

      setChatUser({
        rId: user.id,
        messageId,
        userData: user,
      });

      setSearch("");
      setChatVisible(true);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // 💬 OPEN EXISTING CHAT
  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);

      setChatUser({
        rId: item.rId,
        messageId: item.messageId,
        userData: item.userData,
      });

      const userChatsRef = doc(db, "chats", userData.id);
      const userChatSnapshot = await getDoc(userChatsRef);

      if (!userChatSnapshot.exists()) return;

      const userChatsData = userChatSnapshot.data();

      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );

      if (chatIndex === -1) return;

      const updatedChats = [...userChatsData.chatsData];

      updatedChats[chatIndex].messageSeen = true;

      await updateDoc(userChatsRef, {
        chatsData: updatedChats,
      });

      setChatVisible(true);
    } catch (error) {
      console.log(error.message);
    }
  };

  // 🔥 REMOVE DUPLICATES
  const uniqueChats = chatData
    ? Array.from(new Map(chatData.map((item) => [item.rId, item])).values())
    : [];

  return (
    <div className={`cover-leftsidebar ${chatVisible ? "sidebar-hidden" : ""}`}>
      <div className="main-leftSidebar">

        {/* NAV */}
        <div className="nav-leftsidebar">
          <img src={assets.logo_chat} className='chat-logo' />

          <div className="menu">
            <img src={assets.menu_icon} />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>edit profile</p>
              <hr />
              <p onClick={() => logOut()}>logout</p>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="search-leftsidebar">
          <img src={assets.search_icon} />
          <input
            value={search}
            onChange={inputHandler}
            type="text"
            placeholder="search"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="listfriends-leftsidebar">
        {search ? (
          users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => addChat(user)}
                className="eachfriend-leftsidebar"
              >
                <img src={user.avatar} />
                <div>
                  <p>{user.name}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No users found</p>
          )
        ) : uniqueChats.length > 0 ? (
          uniqueChats.map((chat) => (
            <div
              key={chat.rId}
              onClick={() => setChat(chat)}
              className="eachfriend-leftsidebar"
            >
              <img src={chat.userData?.avatar} />
              <div>
                <p>{chat.userData?.name}</p>
                <span>{chat.lastMessage}</span>
              </div>
            </div>
          ))
        ) : (
          <p className='no-user'>No chats yet</p>
        )}
      </div>
    </div>
  );
}