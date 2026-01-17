import { Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import PublicRoutes from "./PublicRoutes";
import Login from "../../Pages/login_signup/Login";
import Register from "../../Pages/login_signup/Register";
import ForgotPass from "../../Pages/login_signup/ForgotPass";
import Dashboard from "../../Pages/app_main/dashboard/Dashboard";
import Classes from "../../Pages/app_main/classes/Classes";
import Teachers from "../../Pages/app_main/teachers/Teachers";
import Error404 from "../../Pages/error/Error404";

const RouteManager = () => {
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
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        }
      />

      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default RouteManager;
