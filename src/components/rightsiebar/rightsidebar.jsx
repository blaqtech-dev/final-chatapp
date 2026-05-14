import { useContext, useEffect, useState } from 'react'
import assets from '../../assets/assets'
import { logOut } from '../../config/firebase'
import './rightsidebar.css'
import { AppContext } from '../../context/appcontext'


export function RightSidebar(){



    const {chatUser,messages}=useContext(AppContext)
    const [messageImages,setMessageImages]=useState([])

    useEffect(()=>{
let tempVar=[]
messages.map((msg)=>{
    if(msg.image){
        tempVar.push(msg.image)
    }
})
setMessageImages(tempVar)
    },[messages])

    return chatUser?(
        <div className='cover-rightsidebar'>
            <div className='top-rightside'>
<img src={chatUser.userData.avatar}/>
<h3> {Date.now()-chatUser.userData.lastSeen<=70000?<img src={assets.green_dot} className='dot'/>:null}{chatUser.userData.name}  </h3>
<p>{chatUser.userData.bio}</p>
            </div>
            <hr/>

            <div className='rs-media'>
<p>media</p>
<div>
    {messageImages.map((urlImages,index)=>(<img onClick={()=>window.open(urlImages)} key={index} src={urlImages} alt='images'/>))}
</div>
            </div>
         <button onClick={()=>logOut()}>logout</button>
        </div>
    ):(
        <div className='cover-rightsidebar'>
           <button onClick={()=>logOut()}>logout</button>
        </div>
    )
}