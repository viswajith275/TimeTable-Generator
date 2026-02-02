import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
const GlobalDataContext = createContext();

const GlobalDataProvider = ({ children }) => {
  const { refreshToken, isAuthenticated } = useAuth();
  // timetable data
  const [timetables, setTimetables] = useState([]);
  const [timetableError, setTimeTableError] = useState(null);
  const [timeTableLoaded, setTimeTableLoaded] = useState(false);
  const [timeTableLoading, setTimeTableLoading] = useState(false);

  //reset context on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setTimeTableError(null);
      setTimeTableLoaded(false);
      setTimeTableLoading(false);
      setTimetables([]);
    }
  }, [isAuthenticated]);

  const fetchTimeTables = async (hasRetried = false) => {
    if (timeTableLoading || timeTableLoaded) return;

    try {
      //resetting
      setTimeTableLoading(true);
      setTimeTableError(null);
      //fetching
      const { data } = await axios.get("/api/timetables");
      console.log("FETCHED TIMETABLES IN CONTEXT");
      setTimetables(data);
      setTimeTableLoaded(true);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 && !hasRetried) {
        await refreshToken();
        return fetchTimeTables(true);
      }

      setTimeTableError(status ?? "UNKNOWN_ERROR");
    } finally {
      setTimeTableLoading(false);
    }
  };

  const value = {
    timeTableLoaded,
    timetables,
    setTimetables,
    timetableError,
    fetchTimeTables,
  };
  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export default GlobalDataProvider;

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error("useGlobalData must be used within provider");
  }
  return context;
};
