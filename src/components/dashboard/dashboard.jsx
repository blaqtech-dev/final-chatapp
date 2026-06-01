import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/appcontext";
import { CreatePost } from "../../components/createpost/CreatePost";

import {
  collection,
  onSnapshot,
  deleteDoc, doc
} from "firebase/firestore";

import { db } from "../../config/firebase";


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

  // 🔥 REAL TIME STATS LISTENER
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
        <button onClick={() => navigate("/home")}>
          Home Feed
        </button>

        <button onClick={() => navigate("/chat")}>
          Chat
        </button>

        <button onClick={() => navigate("/profile")}>
          Profile
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        {/* WELCOME */}
        <div className="welcome-card">
          <img
            src={userData?.avatar}
            className="welcome-avatar"
          />

          <div>
            <h2>Welcome, {userData?.name}</h2>
            <p>
              Create posts, chat with friends and manage your profile.
            </p>
          </div>
        </div>

        {/* CREATE POST */}
        <CreatePost />

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
            <h3>Posts</h3>
            <span>{stats.posts}</span>
          </div>

          <div className="stat-card">
            <h3>Likes</h3>
            <span>{stats.likes}</span>
          </div>

         

        </div>

      

      </div>
    </div>
  );
}