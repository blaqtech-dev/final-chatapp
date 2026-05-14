import { useState, useEffect } from "react";
import assets from "../../assets/assets";
import './update.css'
import { db } from "../../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "../../lib/upload";

export function UpdateProfile(){

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔥 FETCH USER DATA WHEN PAGE LOADS
  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;

      const docRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setBio(data.bio || "");
        setImageUrl(data.avatar || "");
      }
    };

    fetchUser();
  }, []);

  // 🔥 UPLOAD IMAGE TO CLOUDINARY
   

  // 🔥 HANDLE SUBMIT
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const uploadedUrl = image
      ? await uploadImage(image)
      : imageUrl;

    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        name,
        bio,
        avatar: uploadedUrl,
      },
      { merge: true }
    );

    navigate("/chat");
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  return(
    <div className='profile'>
      <div className='profile-container'>
        <form onSubmit={handleSubmit}>
          <h3>profile details</h3>

          <label htmlFor="avatar">
            <input 
              type='file' 
              onChange={(e)=>setImage(e.target.files[0])} 
              id='avatar' 
              accept='.png, .jpg, .jpeg' 
              hidden
            />

            <img 
              src={
                image 
                  ? URL.createObjectURL(image) 
                  : imageUrl || assets.avatar_icon
              } 
            />
           <span className='upload-span'>upload image</span> 
          </label>

          <input 
            type='text' 
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder='your name' 
            required
          />

          <textarea 
            value={bio}
            onChange={(e)=>setBio(e.target.value)}
            placeholder='write profile bio' 
            required
          ></textarea>

          <button disabled={loading}>
  {loading ? "Saving..." : "Save"}
</button>
        </form>

        <img 
          src={
            image 
              ? URL.createObjectURL(image) 
              : imageUrl || assets.logo_icon
          } 
          className='profile-img'
        />
      </div>
    </div>
  )
}