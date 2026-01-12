import "./App.css";
import { useAuth } from "./Context/AuthProvider";

import ForgotPass from "./Pages/login_signup/ForgotPass";
import Register from "./Pages/login_signup/Register";
import Login from "./Pages/login_signup/Login";
import Dashboard from "./Pages/app_main/dashboard/Dashboard";
import Classes from "./Pages/app_main/classes/Classes";
import Teachers from "./Pages/app_main/teachers/Teachers";
import Loader from "./Pages/app_main/Components/loader/Loader";
import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./Utils/Routing/ProtectedRoutes";
import PublicRoutes from "./Utils/Routing/PublicRoutes";
function App() {
  const { isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="loader_container">
  //       <Loader />
  //     </div>
  //   );
  // }
  return (
    <>
      <Routes>
        {/* Public Routes */}
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
        ></Route>

        {/* Protected Routes */}
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

      <div
        className="loader_container"
        style={{ display: !isLoading ? "none" : "flex" }}
      >
        <Loader></Loader>
      </div>
    </>
  );
}

export default App;
