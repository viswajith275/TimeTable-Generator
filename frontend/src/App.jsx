import "./App.css";
import { useAuth } from "./Context/AuthProvider";

import ForgotPass from "./Pages/login_signup/ForgotPass";
import Register from "./Pages/login_signup/Register";
import Login from "./Pages/login_signup/Login";
import Dashboard from "./Pages/app_main/dashboard/Dashboard";
import Classes from "./Pages/app_main/classes/Classes";
import Teachers from "./Pages/app_main/teachers/Teachers";
import Loader from "./Pages/app_main/Components/loader/Loader";

function App() {
  console.log(useAuth());
  return (
    <>
      <div className="loader_container">
        <Loader></Loader>
      </div>
    </>
  );
}

export default App;
