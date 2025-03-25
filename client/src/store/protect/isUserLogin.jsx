import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate,Navigate } from 'react-router-dom'


const IsUserLogin = ({children}) => {
   
const user =useSelector((state)=>state?.user?.isAuthenticated)
if(!user){
    return <Navigate to={'/login'}/>
}
return children
}

export default IsUserLogin