import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protects routes that only authenticated users can access
export const ProtectedUserRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  const admin = useSelector((state) => state.admin.admin);

  if (user?.role === 'user') {
    return children; // Allow access if user is authenticated
  } else if (admin?.role === 'admin') {
    return <Navigate to="/admin/dashboard" />; // Redirect admins to admin dashboard
  } else {
    return <Navigate to="/auth/login" />; // Redirect unauthenticated to login
  }
};

// Protects routes that only authenticated admins can access
export const ProtectedAdminRoute = ({ children }) => {
  const admin = useSelector((state) => state.admin.admin);
  const user = useSelector((state) => state.user.user);

  if (admin?.role === 'admin') {
    return children; // Allow access if admin is authenticated
  } else if (user?.role === 'user') {
    return <Navigate to="/" />; // Redirect users to home
  } else {
    return <Navigate to="/auth/admin-login" />; // Redirect unauthenticated to admin login
  }
};

// Protects auth routes, redirecting authenticated users/admins away
export const AuthRoute = ({ children, isAdminRoute = false }) => {
  const user = useSelector((state) => state.user.user);
  const admin = useSelector((state) => state.admin.admin);

  if (isAdminRoute) {
    if (admin?.role === 'admin') {
      return <Navigate to="/admin/dashboard" />; // Redirect logged-in admin
    } else if (user?.role === 'user') {
      return <Navigate to="/" />; // Redirect logged-in user
    }
  } else {
    if (user?.role === 'user') {
      return <Navigate to="/" />; // Redirect logged-in user
    } else if (admin?.role === 'admin') {
      return <Navigate to="/admin/dashboard" />; // Redirect logged-in admin
    }
  }

  return children; // Allow access if not authenticated
};