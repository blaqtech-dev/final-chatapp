import { useEffect, useState, useContext } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/appcontext";

import './feed.css'
import { PostCard } from "../postcard/postcard";


export function Feed() {
  const { userData } = useContext(AppContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  // ❤️ LIKE
  const toggleLike = async (postId, likes=[]) => {
    const ref = doc(db, "posts", postId);

   const isLiked = Array.isArray(likes) && likes.includes(userData.id);

    await updateDoc(ref, {
      likes: isLiked
        ? arrayRemove(userData.id)
        : arrayUnion(userData.id),
    });
  };

  // 💬 COMMENT
  const addComment = async (postId, text) => {
    if (!text) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      userId: userData.id,
      userName: userData.name,
      text,
      createdAt: serverTimestamp(),
    });
  };

  // 🔁 SHARE (simple counter)
  const sharePost = async (postId) => {
    const ref = doc(db, "posts", postId);

  await updateDoc(ref, {
  shares: increment(1),
});
  };

  return (
    <div className="feed">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={toggleLike}
          onComment={addComment}
          onShare={sharePost}
        />
      ))}
    </div>
  );
}