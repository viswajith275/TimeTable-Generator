import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";

const TeacherContext = createContext(null);

const TeacherProvider = ({ children }) => {
  const { refreshToken, isAuthenticated } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [teachersLoaded, setTeachersLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  //reset data on logout basically
  useEffect(() => {
    if (!isAuthenticated) {
      setTeachers([]);
      setTeachersLoaded(false);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchTeachers = async (hasRetried = false) => {
    if (teachersLoaded || loading) return;

    try {
      setLoading(true);
      setError(null); //reseting

      const { data } = await axios.get("/api/teachers");
      console.log("FETCHED TEACHERS IN CONTEXT");
      setTeachers(data);
      setTeachersLoaded(true);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 && !hasRetried) {
        await refreshToken();
        return fetchTeachers(true);
      }
      setError(status ?? "UNKNOWN_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    teachers,
    setTeachers,
    teachersLoaded,
    error,
    fetchTeachers,
  };
  return (
    <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>
  );
};

export default TeacherProvider;

export const useTeachers = () => {
  const context = useContext(TeacherContext);

  if (!context) {
    throw new Error("useTeachers must be used within provider");
  }
  return context;
};
