import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route to enforce authentication and optional role checks.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children   - The page to render when access is granted
 * @param {string[]}        [props.roles]    - Allowed roles; omit to allow any authenticated user
 */
export default function ProtectedRoute({ children, roles }) {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
