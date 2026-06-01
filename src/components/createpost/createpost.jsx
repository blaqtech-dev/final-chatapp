import { useState, useContext } from "react";
import { db } from "../../config/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AppContext } from "../../context/appcontext";
import { uploadImage } from "../../lib/upload";
import './createpost.css'

export function CreatePost() {
  const { userData } = useContext(AppContext);

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text && !image) return;

    setLoading(true);

    let imageUrl = "";

    if (image) {
      imageUrl = await uploadImage(image);
    }

    await addDoc(collection(db, "posts"), {
      userId: userData.id,
      userName: userData.name,
      userAvatar: userData.avatar,
      text,
      image: imageUrl,
      likes: [],
      shares: 0,
      createdAt: serverTimestamp(),
    });

    setText("");
    setImage(null);
    setLoading(false);
  };

  return (
    <div className="create-post">
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={handlePost} disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}