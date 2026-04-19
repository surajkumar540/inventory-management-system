import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
