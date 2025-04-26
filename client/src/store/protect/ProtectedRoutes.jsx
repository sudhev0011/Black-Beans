import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCheckAuthQuery } from "../api/userApiSlice";
import OrganicLoading from "@/components/ui/loading/OrganicLoading";

// export const ProtectedUserRoute = ({ children }) => {
//   const user = useSelector((state) => state.user.user);
//   const admin = useSelector((state) => state.admin.admin);
//   console.log('user at ProtectedUserRoute',user);
//   const { isLoading } = useCheckAuthQuery(); // Add this

//   if (isLoading) {
//     console.log("if isLoading",isLoading);
    
//     return <OrganicLoading />; // Or some loading indicator
//   }
  

//   if (user?.role === "user") {
//     return children;
//   } else if (admin?.role === "admin") {
//     return <Navigate to="/admin/dashboard" />;
//   } else {
//     return <Navigate to="/auth/login" />;
//   }
// };

// export const ProtectedAdminRoute = ({ children }) => {
//   const admin = useSelector((state) => state.admin.admin);
//   const user = useSelector((state) => state.user.user);

//   if (admin?.role === "admin") {
//     return children;
//   } else if (user?.role === "user") {
//     return <Navigate to="/user" />;
//   } else {
//     return <Navigate to="/auth/admin-login" />;
//   }
// };

export const ProtectedUserRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  const admin = useSelector((state) => state.admin.admin);
  const { isLoading, isError, error } = useCheckAuthQuery();

  console.log("ProtectedUserRoute - user:", user, "admin:", admin, "isLoading:", isLoading, "isError:", isError, "error:", error);

  if (isLoading) {
    return <OrganicLoading />;
  }

  if (isError) {
    console.log("ProtectedUserRoute - auth error:", error);
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role === "user") {
    return children;
  } else if (admin?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/auth/login" replace />;
  }
};

export const ProtectedAdminRoute = ({ children }) => {
  const admin = useSelector((state) => state.admin.admin);
  const user = useSelector((state) => state.user.user);
  const { isLoading } = useCheckAuthQuery(); 

  if (isLoading) {
    console.log("if isLoading",isLoading);
    
    return <OrganicLoading />; // Or some loading indicator
  }

  if (admin?.role === "admin") {
    return children;
  } else if (user?.role === "user") {
    return <Navigate to="/user" />;
  } else {
    return <Navigate to="/auth/admin-login" />;
  }
};





export const AuthRoute = ({ children, isAdminRoute = false }) => {
  const user = useSelector((state) => state.user.user);
  const admin = useSelector((state) => state.admin.admin);

  if (isAdminRoute) {
    if (admin?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else if (user?.role === "user") {
      return <Navigate to="/user" />;
    }
  } else {
    if (user?.role === "user") {
      return <Navigate to="/" />;
    } else if (admin?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
  }

  return children;
};