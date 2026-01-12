import { Routes, Route } from "react-router-dom";
import { useAuth } from "./Context/AuthProvider";

import Login from "./Pages/login_signup/Login";
import Register from "./Pages/login_signup/Register";
import ForgotPass from "./Pages/login_signup/ForgotPass";

import Dashboard from "./Pages/app_main/dashboard/Dashboard";
import Classes from "./Pages/app_main/classes/Classes";
import Teachers from "./Pages/app_main/teachers/Teachers";

import ProtectedRoutes from "./Utils/Routing/ProtectedRoutes";
import PublicRoutes from "./Utils/Routing/PublicRoutes";
import Loader from "./Pages/app_main/Components/loader/Loader";

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loader_container">
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoutes>
            <Register />
          </PublicRoutes>
        }
      />
      <Route
        path="/forgotpass"
        element={
          <PublicRoutes>
            <ForgotPass />
          </PublicRoutes>
        }
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoutes>
            <Classes />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoutes>
            <Teachers />
          </ProtectedRoutes>
        }
      />
    </Routes>
  );
}

export default App;
