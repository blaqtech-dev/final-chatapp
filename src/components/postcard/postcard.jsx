import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import './postcard.css'

export function PostCard({ post, onLike, onComment, onShare }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "posts", post.id, "comments"),
      (snap) => {
        setComments(snap.docs.map((d) => d.data()));
      }
    );

    return () => unsub();
  }, [post.id]);

  return (
    <div className="post-card">
      {/* USER INFO */}
      <div className="post-header">
       <img
  src={post.userAvatar || "/default-avatar.png"}
  alt={post.userName}
/>
        <h4>{post.userName}</h4>
      </div>

      {/* CONTENT */}
     <p className="post-text">{post.text}</p>

      {post.image && <img src={post.image} className="post-image" />}

      {/* ACTIONS */}
      <div className="actions">
        <button onClick={() => onLike(post.id, post.likes)}>
        ❤️ {post.likes?.length || 0}
        </button>

        <button onClick={() => onShare(post.id)}>
          🔁 {post.shares}
        </button>
      </div>

      {/* COMMENT BOX */}
      <div className="comment-box">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="write comment..."
        />
        <button
          onClick={() => {
            onComment(post.id, comment);
            setComment("");
          }}
        >
          send
        </button>
      </div>

      {/* COMMENTS LIST */}
      <div className="comments">
        {comments.map((c, i) => (
          <p key={i}>
            <b>{c.userName}:</b> {c.text}
          </p>
        ))}
      </div>
    </div>
  );
}