
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { LoginIn } from './pages/login/login'
import { Chat } from './pages/chat/chat'
import { UpdateProfile } from './pages/updateprofile/update'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { useContext, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { AppContext } from './context/appcontext'
import { CreatePost } from './components/createpost/createpost'
import { Dashboard } from './components/dashboard/dashboard'
import { Home } from './components/homepage/homepage'



function App() {
    const navigate=useNavigate()

    const {loadUserData}=useContext(AppContext)


useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadUserData(user.uid);
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  });

  return () => unsub();
}, []);

return(
<div>
    <ToastContainer/>
   
    <Routes>
        <Route path='/' element={<LoginIn/>}></Route>
         <Route path='/chat' element={<Chat/>}></Route>
          <Route path='/dashboard' element={<Dashboard/>}></Route>
            <Route path='/create' element={<CreatePost/>}></Route>
             <Route
    path="/home"
    element={<Home />}
  />
          <Route path='/profile' element={<UpdateProfile/>}></Route>
    </Routes>
</div>

)
 
}

export default App
