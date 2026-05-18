import { useContext, useEffect, useRef, useState } from "react";
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

  // 🔥 voice recording
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // 🔥 AUDIO CONTROL FIX (IMPORTANT)
  const [activeAudioId, setActiveAudioId] = useState(null);
  const audioRefs = useRef({});

  // ================= VOICE RECORDING =================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks = [];

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

  // ================= UPLOAD VOICE =================
  const uploadVoiceNote = async (audioBlob) => {
    try {
      const formData = new FormData();

      formData.append("file", audioBlob);
      formData.append("upload_preset", "bolu_abiola");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/drhflo9zn/video/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          audio: data.secure_url,
          createdAt: new Date(),
        }),
      });

      await updateLastMessage("🎤 voice message");
    } catch (err) {
      console.log(err);
    }
  };

  // ================= UPDATE LAST MESSAGE =================
  const updateLastMessage = async (lastMessage) => {
    const userIds = [chatUser.rId, userData.id];

    for (const id of userIds) {
      const userChatRef = doc(db, "chats", id);
      const snap = await getDoc(userChatRef);

      if (!snap.exists()) continue;

      const data = snap.data();

      const index = data.chatsData.findIndex(
        (c) => c.messageId === messagesId
      );

      if (index === -1) continue;

      const updated = [...data.chatsData];

      updated[index] = {
        ...updated[index],
        lastMessage,
        updatedAt: Date.now(),
      };

      await updateDoc(userChatRef, {
        chatsData: updated,
      });
    }
  };

  // ================= SEND TEXT =================
  const sendMessage = async () => {
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
  };

  // ================= SEND IMAGE =================
  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = await uploadImage(file);

    await updateDoc(doc(db, "messages", messagesId), {
      messages: arrayUnion({
        sId: userData.id,
        image: fileUrl,
        createdAt: new Date(),
      }),
    });

    await updateLastMessage("sent a photo");
  };

  // ================= TIME FORMAT =================
  const covertTime = (timeStamp) => {
    const date = timeStamp.toDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours > 12
      ? hours - 12 + ":" + minutes + " PM"
      : hours + ":" + minutes + " AM";
  };

  // ================= REALTIME MESSAGES =================
  useEffect(() => {
    if (!messagesId) return;

    const unsub = onSnapshot(doc(db, "messages", messagesId), (res) => {
      const data = res.data();
      if (!data?.messages) return setMessages([]);

      setMessages([...data.messages].reverse());
    });

    return () => unsub();
  }, [messagesId]);

  // ================= AUDIO CONTROL =================
  const handleAudioPlay = (index) => {
    const currentAudio = audioRefs.current[index];

    // pause previous
    if (activeAudioId !== null && activeAudioId !== index) {
      const prev = audioRefs.current[activeAudioId];
      if (prev) prev.pause();
    }

    // toggle same audio
    if (activeAudioId === index) {
      currentAudio.pause();
      setActiveAudioId(null);
      return;
    }

    currentAudio.play();
    setActiveAudioId(index);
  };

  // ================= UI =================
  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "chat-hidden"}`}>
      {/* HEADER */}
      <div className="chat-user">
        <img src={chatUser.userData.avatar} />
        <p>{chatUser.userData.name}</p>

        <img
          onClick={() => setChatVisible(false)}
          className="arrow"
          src={assets.arrow_icon}
        />
      </div>

      {/* MESSAGES */}
      <div className="chat-message">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-message" : "r-message"}
          >
        
            {msg.audio ? (
              <div className="voice-note">
                <button
                  className="play-btn"
                  onClick={() => handleAudioPlay(index)}
                >
                  {activeAudioId === index ? "❚❚" : "▶"}
                </button>

                <audio
                  ref={(el) => (audioRefs.current[index] = el)}
                  src={msg.audio}
                />
              </div>
            ) : msg.image ? (
              <img className="chat-image" src={msg.image} />
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

     
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="send a message"
        />

        <label htmlFor="image">
          <img src={assets.gallery_icon} />
        </label>

        <input
          id="image"
          type="file"
          hidden
          onChange={sendImage}
          accept="image/*"
        />

        <img src={assets.send_button} onClick={sendMessage} />

        <button
          onClick={recording ? stopRecording : startRecording}
          className="voicenote"
        >
          {recording ? "⏹" : "🎤"}
        </button>
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.logo_icon} />
      <p>chat anytime</p>
    </div>
  );
}