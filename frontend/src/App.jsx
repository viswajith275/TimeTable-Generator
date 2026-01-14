import { useAuth } from "./Context/AuthProvider";
import "./App.css";

//react toastify bs for notification system
//dont remove these imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loader from "./Pages/app_main/Components/loader/Loader";
import RouteManager from "./Utils/Routing/RouteManager";
function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loader_container">
        <Loader />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
      <RouteManager />
    </>
  );
}

export default App;
