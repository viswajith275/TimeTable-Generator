import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";

const SubjectsContext = createContext(null);

const SubjectsProvider = ({ children }) => {
  const { refreshToken } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = async (hasRetried = false) => {
    // prevent refetch once loaded
    if (subjectsLoaded) return;

    try {
      setError(null);

      const { data } = await axios.get("/api/subjects");
      console.log("FETCHED SUBJECTS IN CONTEXT");
      setSubjects(data);
      setSubjectsLoaded(true);
    } catch (err) {
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        return fetchSubjects(true);
      }

      setError(err?.response?.status ?? "UNKNOWN_ERROR");
      console.error(err);
    }
  };

  const value = {
    subjects,
    setSubjects,
    subjectsLoaded,
    error,
    fetchSubjects,
  };

  return (
    <SubjectsContext.Provider value={value}>
      {children}
    </SubjectsContext.Provider>
  );
};

export default SubjectsProvider;

export const useSubjects = () => {
  const context = useContext(SubjectsContext);
  if (!context) {
    throw new Error("useSubjects must be used within SubjectsProvider");
  }
  return context;
};
