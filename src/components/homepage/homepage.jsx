import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/appcontext";
import {Feed} from '../feed/feed'

import "./home.css";

export function Home() {
  const navigate = useNavigate();

  const { userData } = useContext(AppContext);

  return (
    <div className="home-page">

      {/* LEFT SIDEBAR */}
      <div className="home-sidebar">

        <div className="user-card">
          <img src={userData?.avatar} alt="" />
          <h3>{userData?.name}</h3>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/chat")}>
          Chat
        </button>

        <button onClick={() => navigate("/profile")}>
          Profile
        </button>

      </div>

      {/* FEED AREA */}
      <div className="feed-wrapper">

        <div className="feed-header">
          <h1>Community Feed</h1>

          <p>
            See what everyone is posting
          </p>
        </div>

        <Feed />

      </div>

      {/* RIGHT SIDEBAR */}
      <div className="right-sidebar">

        <div className="info-card">
          <h3>Welcome</h3>

          <p>
            Discover posts from the community.
          </p>
        </div>

        <div className="info-card">
          <h3>Quick Tips</h3>

          <p>
            Like, comment and share posts.
          </p>
        </div>

      </div>

    </div>
  );
}