import { Routes, Route } from "react-router-dom";
import { useAuth } from "./Context/AuthProvider";
import "./App.css";
import Login from "./Pages/login_signup/Login";
import Register from "./Pages/login_signup/Register";
import ForgotPass from "./Pages/login_signup/ForgotPass";

import Dashboard from "./Pages/app_main/dashboard/Dashboard";
import Classes from "./Pages/app_main/classes/Classes";
import Teachers from "./Pages/app_main/teachers/Teachers";

import ProtectedRoutes from "./Utils/Routing/ProtectedRoutes";
import PublicRoutes from "./Utils/Routing/PublicRoutes";
import Loader from "./Pages/app_main/Components/loader/Loader";
import RouteManager from "./Utils/Routing/RouteManager";
function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    console.log("loading");
    return (
      <div className="loader_container">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <RouteManager />
    </>
  );
}

export default App;
