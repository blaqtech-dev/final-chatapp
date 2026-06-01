import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/appcontext";
import { CreatePost } from "../createpost/createpost";

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import { InstallPWA } from "../installpwa/installpwa";

import "./dashboard.css";

export function Dashboard() {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);

  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    comments: 0,
  });

  // 🔥 REAL TIME STATS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "posts"), (snap) => {
      let postCount = 0;
      let likeCount = 0;
      let commentCount = 0;

      snap.forEach((doc) => {
        const data = doc.data();

        postCount++;
        likeCount += data.likes?.length || 0;
        commentCount += data.commentsCount || 0;
      });

      setStats({
        posts: postCount,
        likes: likeCount,
        comments: commentCount,
      });
    });

    return () => unsub();
  }, []);

  // 🔥 USER POSTS
  useEffect(() => {
    if (!userData?.id) return;

    const unsub = onSnapshot(collection(db, "posts"), (snap) => {
      const userPosts = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((post) => post.userId === userData.id);

      setMyPosts(userPosts);
    });

    return () => unsub();
  }, [userData?.id]);

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
  };

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <div className="sidebar">
        <button onClick={() => navigate("/home")}>Home Feed</button>
        <button onClick={() => navigate("/chat")}>Chat</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
      </div>

      {/* MAIN AREA */}
      <div className="dashboard-content">
         

        {/* HEADER */}
        <div className="dashboard-header">
          <div className="welcome-card">
       <img
  src={userData?.avatar || "/avataruser.png"}
  alt="avatar"
  className="welcome-avatar"
/>

            <div>
              <h2>Welcome, {userData?.name}</h2>
              <p>Create posts, chat with friends and manage your profile.</p>
            </div>
          </div>

          {/* ⭐ BEST PLACE FOR INSTALL BUTTON */}
          <div className="install-wrapper">
            <InstallPWA />
          </div>
        </div>

        {/* CREATE POST */}
        <CreatePost />

        {/* MY POSTS */}
        <div className="my-posts">
          <h3>My Posts</h3>

          {myPosts.map((post) => (
            <div key={post.id} className="my-post-card">
              <p>{post.text}</p>

              {post.image && (
                <img src={post.image} className="my-post-img" />
              )}

              <button onClick={() => deletePost(post.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>all Posts</h3>
            <span>{stats.posts}</span>
          </div>

          <div className="stat-card">
            <h3>Likes</h3>
            <span>{stats.likes}</span>
          </div>

          <div className="stat-card">
            <h3>Comments</h3>
            <span>{stats.comments}</span>
          </div>
        </div>

      </div>
    </div>
  );
}