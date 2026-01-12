import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthProvider";
import Loader from "../../Pages/app_main/Components/loader/Loader";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loader_container">
        <Loader></Loader>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
