import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login         from './pages/Login';
import AdminPage     from './pages/AdminPage';
import InventoryPage from './pages/InventoryPage';
import PosPage       from './pages/PosPage';
import Unauthorized  from './pages/Unauthorized';

// Root redirect: send authenticated users to their role's dashboard,
// unauthenticated users to /login.
function RootRedirect() {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  const destinations = {
    ADMIN:             '/admin',
    INVENTORY_MANAGER: '/inventory',
    CASHIER:           '/pos',
  };
  return <Navigate to={destinations[role] ?? '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"        element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Role-protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute roles={['INVENTORY_MANAGER', 'ADMIN']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute roles={['CASHIER', 'INVENTORY_MANAGER', 'ADMIN']}>
                <PosPage />
              </ProtectedRoute>
            }
          />

          {/* Root: smart redirect based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
