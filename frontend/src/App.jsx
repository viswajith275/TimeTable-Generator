import { useAuth } from "./Context/AuthProvider";
import "./App.css";

import Loader from "./Pages/app_main/Components/loader/Loader";
import RouteManager from "./Utils/Routing/RouteManager";
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
    <>
      <RouteManager />
    </>
  );
}

export default App;
