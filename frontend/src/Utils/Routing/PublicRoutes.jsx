import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthProvider";
const PublicRoutes = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoutes;
