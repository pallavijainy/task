import { useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const App = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Get default route based on role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'manager') return '/manager/dashboard';
    return '/employee/dashboard';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={<Navigate to={getDefaultRoute()} replace />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Signup />}
        />

        {/* Protected Employee Routes */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={['employee']}
              userRole={user?.role}
              redirectTo={getDefaultRoute()}
            />
          }
        >
          <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/employee/*" element={<EmployeeDashboard />} />
        </Route>

        {/* Protected Manager Routes */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={['manager']}
              userRole={user?.role}
              redirectTo={getDefaultRoute()}
            />
          }
        >
          <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="/manager/*" element={<ManagerDashboard />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              allowedRoles={['admin']}
              userRole={user?.role}
              redirectTo={getDefaultRoute()}
            />
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
