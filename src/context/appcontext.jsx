import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useRef, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext(null); // ✅ FIX HMR issue

const AppContextProvider = (props) => {
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // ---------------- LOAD USER ----------------
  const loadUserData = async (uid) => {
    try {
      if (!uid) return;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();

      setUserData({
        id: userSnap.id,
        ...data,
      });

      if (data.avatar && data.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {
      console.log(error.message);
    }
  };

  // ---------------- 🔥 REAL-TIME USER SYNC ----------------
  useEffect(() => {
    if (!userData?.id) return;

    const userRef = doc(db, "users", userData.id);

    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) return;

      setUserData({
        id: snap.id,
        ...snap.data(),
      });
    });

    return () => unsub();
  }, [userData?.id]);

  // ---------------- CHAT LISTENER ----------------
  useEffect(() => {
    if (!userData?.id) return;

    const chatRef = doc(db, "chats", userData.id);

    const unSub = onSnapshot(chatRef, async (res) => {
      const data = res.data();

      if (!data?.chatsData || data.chatsData.length === 0) {
        setChatData([]);
        setChatUser(null);
        setMessagesId(null);
        return;
      }

      const tempData = [];

      for (const item of data.chatsData) {
        try {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) continue;

          tempData.push({
            ...item,
            userData: {
              id: userSnap.id,
              ...userSnap.data(),
            },
          });
        } catch (err) {
          console.log("Chat item error:", err);
        }
      }

      setChatData(
        tempData.sort((a, b) => b.updatedAt - a.updatedAt)
      );
    });

    return () => unSub();
  }, [userData?.id]);

  // ---------------- 🔥 REAL-TIME CHAT USER SYNC ----------------
  useEffect(() => {
    if (!chatUser?.rId) return;

    const unsub = onSnapshot(doc(db, "users", chatUser.rId), (snap) => {
      if (!snap.exists()) return;

      setChatUser((prev) => ({
        ...prev,
        userData: {
          id: snap.id,
          ...snap.data(),
        },
      }));
    });

    return () => unsub();
  }, [chatUser?.rId]);

  // ---------------- CONTEXT VALUE ----------------
  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messagesId,
    setMessagesId,
    messages,
    setMessages,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;