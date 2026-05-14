
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5tSL1bXBKaEh973HeGITw80GuHQy4fbI",
  authDomain: "blue-chat-6f9a3.firebaseapp.com",
  projectId: "blue-chat-6f9a3",
  storageBucket: "blue-chat-6f9a3.firebasestorage.app",
  messagingSenderId: "414167467652",
  appId: "1:414167467652:web:097130b64bc18e898e24d1"
};


const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
const db=getFirestore(app)

const signUp=async(username,email,password)=>{
    try {
        const res=await createUserWithEmailAndPassword(auth,email,password);
        const user=res.user

        await setDoc(doc(db,'users',user.uid),{
id:user.uid,
username:username.toLowerCase(),
name:'',
email,
avatar:'',
bio:'hey,i am using  bluechat',
lastSeen:Date.now()
        })

        await setDoc(doc(db,'chats',user.uid),{
chatsData:[]
        })
    } catch (error) {
        console.log(error)
           toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}

const Login=async(email,password)=>{
    try {
        await signInWithEmailAndPassword(auth,email,password)
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}

const logOut=async()=>{
    try {
         await   signOut(auth)
    } catch (error) {
          console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
 
}

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: "http://localhost:5173/login", // change if deployed
    });

    console.log("✅ RESET EMAIL SENT");
    toast.success("Check your inbox or spam folder for the reset link");
    toast.success("If this email exists, check your inbox");
    
  } catch (error) {
    console.log("❌ ERROR:", error.code, error.message);

    if (error.code === "auth/user-not-found") {
      toast.error("Email not registered in Firebase Auth");
    } else if (error.code === "auth/too-many-requests") {
      toast.error("Too many attempts, try again later");
    } else {
      toast.error(error.message);
    }
  }
};
export {signUp,Login,logOut,auth,db,resetPass}