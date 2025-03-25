import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate,Navigate } from 'react-router-dom'
import { toast } from 'sonner'


const IsAdminLogin = ({children}) => {
    const navigate=useNavigate()
const admin =useSelector((state)=>state?.admin?.isAuthenticated)
console.log('admin data',admin);

if(!admin){
    toast.info('Login as admin');
    return <Navigate to={'/admin'}/>
}
return children
}

export default IsAdminLogin