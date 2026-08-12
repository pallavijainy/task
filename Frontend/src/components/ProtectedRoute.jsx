import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, allowedRoles, userRole, redirectTo }) => {
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but role is not allowed, redirect to their default route
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo || '/login'} replace />;
  }

  // If all checks pass, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;
