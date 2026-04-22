// components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const ProtectedRoute = ({ children, role }) => {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  // role is array like ["ADMIN"] or ["ADMIN","MANAGER"] or null
  if (role && !role.includes(user?.role)) {
    return <Navigate to="/orders" replace />;
  }

  return children;
};

export default ProtectedRoute;