import { useContext, useEffect, useState } from "react";
import assets from "../../assets/assets";
import "./chatbox.css";
import { AppContext } from "../../context/appcontext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import { uploadImage } from "../../lib/upload";



export function ChatBox() {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);

  const [input, setInput] = useState("");



  // voice not implementation
const [recording, setRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);


const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    const chunks = [];
    setAudioChunks([]);

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      uploadVoiceNote(audioBlob);
    };

    recorder.start();
    setRecording(true);
  } catch (err) {
    console.log(err);
  }
};

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    setRecording(false);
  }
};


const uploadVoiceNote = async (audioBlob) => {
  try {
    const formData = new FormData();

    formData.append("file", audioBlob);
    formData.append("upload_preset", "bolu_abiola"); // same preset you use

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/drhflo9zn/video/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    const audioUrl = data.secure_url;

    await updateDoc(doc(db, "messages", messagesId), {
      messages: arrayUnion({
        sId: userData.id,
        audio: audioUrl,
        createdAt: new Date(),
      }),
    });

    await updateLastMessage("🎤 voice message");
  } catch (err) {
    console.log(err);
  }
};











  // ✅ SAFE UPDATE FUNCTION (FIXES chatIndex ERROR)
  const updateLastMessage = async (lastMessage) => {
    const userIds = [chatUser.rId, userData.id];

    for (const id of userIds) {
      try {
        const userChatRef = doc(db, "chats", id);
        const snap = await getDoc(userChatRef);

        if (!snap.exists()) continue;

        const userChatData = snap.data();

        if (!userChatData?.chatsData) continue;

        const chatIndex = userChatData.chatsData.findIndex(
          (c) => c.messageId === messagesId
        );

        // 🚨 prevent crash
        if (chatIndex === -1) {
          console.log("Chat not found for:", messagesId);
          continue;
        }

        const updatedChats = [...userChatData.chatsData];

        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage,
          updatedAt: Date.now(),
          messageSeen:
            updatedChats[chatIndex].rId === userData.id
              ? false
              : updatedChats[chatIndex].messageSeen,
        };

        await updateDoc(userChatRef, {
          chatsData: updatedChats,
        });
      } catch (err) {
        console.log(err);
      }
    }
  };

  // ✅ SEND TEXT MESSAGE
  const sendMessage = async () => {
    try {
      if (!input || !messagesId) return;

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          text: input,
          createdAt: new Date(),
        }),
      });

      await updateLastMessage(input.slice(0, 25));

      setInput("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ SEND IMAGE MESSAGE
  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileUrl = await uploadImage(file);

      if (!fileUrl || !messagesId) return;

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          image: fileUrl,
          createdAt: new Date(),
        }),
      });

      await updateLastMessage("sent a photo");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ FORMAT TIME
  const covertTime = (timeStamp) => {
    let date = timeStamp.toDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    minutes = minutes < 10 ? "0" + minutes : minutes;

    if (hours > 12) {
      return hours - 12 + ":" + minutes + " PM";
    } else {
      return hours + ":" + minutes + " AM";
    }
  };

  // ✅ REAL-TIME MESSAGES
  useEffect(() => {
    if (!messagesId) return;

    const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
      const data = res.data();

      if (!data?.messages) {
        setMessages([]);
        return;
      }

      const reversed = [...data.messages].reverse();
      setMessages(reversed);
    });

    return () => unSub();
  }, [messagesId]);


 





  return chatUser ? (
  <div className={`chat-box ${chatVisible ? "" : "chat-hidden"}`}>
      {/* HEADER */}
      <div className="chat-user">
        <img src={chatUser.userData.avatar} />
        <p>
          {chatUser.userData.name}
          {Date.now()-chatUser.userData.lastSeen<=70000?<img src={assets.green_dot} className='dot'/>:null}
        </p>
        <img src={assets.help_icon} className="help" />

        <img onClick={()=>setChatVisible(false)} className="arrow"   src={assets.arrow_icon}/>
    
    
  
      
     

      </div>

      {/* MESSAGES */}
      <div className="chat-message">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sId === userData.id ? "s-message" : "r-message"
            }
          >

   {msg.audio ? (
  <div className="voice-note">
<audio controls src={msg.audio}></audio>
  </div>
) : msg.image ? (
  <img className="chat-image" src={msg.image}/>
) : (
  <p className="msg">{msg.text}</p>
)}

            <div className="content-chat">
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
              />
              <p>{covertTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          type="text"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder="send a message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <input
          type="file"
          onChange={sendImage}
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />

        <label htmlFor="image">
          <img src={assets.gallery_icon} />
        </label>




        <img src={assets.send_button} onClick={sendMessage} />
        <button
  onClick={recording ? stopRecording : startRecording}
  style={{ background: "none", border: "none" }}
  className='voicenote'
>
  {recording ? "⏹" : "🎤"}
</button>

      </div>
    </div>
  ) : (
<div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} />
      <p>chat anytime</p>
    </div>
  );
}