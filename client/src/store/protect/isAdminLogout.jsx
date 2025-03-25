import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate,Navigate } from 'react-router-dom'

const IsAdminLogout = ({children}) => {
 const navigate =useNavigate()
 const admin = useSelector((state)=>state?.admin.isAuthenticated)
 if(admin){
    //login
    console.log("admin active");
    
    return  <Navigate to={'/admin'}/>
 }
 return children
}

export default IsAdminLogout