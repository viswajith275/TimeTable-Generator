import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";

const ClassesContext = createContext(null);

const ClassesProvider = ({ children }) => {
  const { refreshToken, isAuthenticated } = useAuth();

  const [classes, setClasses] = useState([]);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [error, setError] = useState(null);

  //clear data on logout

  useEffect(() => {
    if (!isAuthenticated) {
      setClasses([]);
      setClassesLoaded(false);
      setError(null);
    }
  }, [isAuthenticated]);

  const fetchClasses = async (hasRetried = false) => {
    //  prevent refetch if already loaded
    if (classesLoaded) return;

    try {
      setError(null);

      const { data } = await axios.get("/api/classes");
      console.log("FETCHED CLASSES IN CONTEXT");
      setClasses(data);
      setClassesLoaded(true);
    } catch (err) {
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        return fetchClasses(true);
      }

      setError(err?.response?.status ?? "UNKNOWN_ERROR");
      console.error(err);
    }
  };

  const value = {
    classes,
    setClasses,
    classesLoaded,
    error,
    fetchClasses,
  };

  return (
    <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>
  );
};

export default ClassesProvider;

export const useClasses = () => {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error("useClasses must be used within ClassesProvider");
  }
  return context;
};
