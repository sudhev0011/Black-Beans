import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate,Navigate } from 'react-router-dom'

const IsUserLogout = ({children}) => {
 
 const user = useSelector((state)=>state?.user.isAuthenticated)
 if(user){
    //login
    console.log("admin active");
    
    return  <Navigate to={'/'}/>
 }
 return children
}

export default IsUserLogout