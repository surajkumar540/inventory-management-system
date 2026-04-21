import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const ProtectedRoute = ({ children, role }) => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 ROLE CHECK
  if (role && user?.role !== role) {
    return <Navigate to="/orders" replace />;
  }

  return children;
};

export default ProtectedRoute;