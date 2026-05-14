
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



function App() {
    const navigate=useNavigate()

    const {loadUserData}=useContext(AppContext)

    useEffect(()=>{
onAuthStateChanged(auth,async(user)=>{
if(user){
navigate('/chat')

await loadUserData(user.uid)
}
else{
navigate('/')
}
})
    },[])

return(
<div>
    <ToastContainer/>
    <Routes>
        <Route path='/' element={<LoginIn/>}></Route>
         <Route path='/chat' element={<Chat/>}></Route>
          <Route path='/profile' element={<UpdateProfile/>}></Route>
    </Routes>
</div>

)
 
}

export default App
