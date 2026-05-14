import { useContext, useEffect, useState } from 'react'
import { ChatBox } from '../../components/chatbox/chatbox'
import { LeftSidebar } from '../../components/leftsidebar/leftsidebar'
import { RightSidebar } from '../../components/rightsiebar/rightsidebar'
import './chat.css'
import { AppContext } from '../../context/appcontext'

export function Chat(){

       const {chatData,userData,chatVisible}=useContext(AppContext)
    const [loading,setLoading]=useState(true)

   useEffect(()=>{
if(chatData && userData){
    setLoading(false)
}
   },[chatData,userData])
 

    return(
        <div className='chat-cover'>

{
    loading? <p className='chat-loading'>Blue_Ping.....</p>:
<div className={`chat-container ${chatVisible ? "chat-active" : ""}`}>
            <LeftSidebar/>
            <ChatBox/>
            <RightSidebar/>
          </div>
}
           
        
       
        </div>
    )
}