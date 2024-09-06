import React, { useContext, useEffect, useState } from 'react'
import './rightsidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
const RightSideBar = () => {
  
    const {chatUser, messages} = useContext(AppContext)
    const [images, setImages] =useState([])
useEffect(()=>{
let temp = []
messages.map((msg => {
  if (msg.Image) {
    temp.push(msg.Image)
  }
setImages(temp)  
}))
},[messages])
  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.user.avatar}/>
        <h3>{chatUser.user.name}</h3>
        <p>{chatUser.user.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
         {images.map(image => <img onClick={()=> window.open(image)} className='imgimg' src={image}/>)}
        </div>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <div className='rs'>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default RightSideBar