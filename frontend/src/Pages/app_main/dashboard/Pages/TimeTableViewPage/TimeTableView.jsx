import styles from "./TimeTable.module.css";
import Navbar from "../../../Components/navbar/Navbar";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import { useState, useEffect } from "react";
import Loader from "../../../Components/loader/Loader";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../../Context/AuthProvider";
import axios from "axios";
import ErrorLoadingStates from "../../../Components/ErrorLoadingStates/ErrorLoadingStates";

const TimeTableView = () => {
  const [timeTable, setTimeTable] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { refreshToken } = useAuth();
  const { timeTableID } = useParams();
  console.log(timeTableID);

  useEffect(() => {
    const loadPageData = async (hasRetried = false) => {
      const start = Date.now();

      try {
        const { data } = await axios.get(`/api/timetables/${timeTableID}`);
        setTimeTable(data);
      } catch (error) {
        if (error?.response?.status == 401 && !hasRetried) {
          await refreshToken();
          return loadPageData(true);
        }
        if (error?.response?.status == 404) {
          return setError(404);
        }
      } finally {
        const MIN_TIME = 500;
        const elapsed = Date.now() - start;
        setTimeout(() => setIsLoading(false), Math.max(MIN_TIME - elapsed, 0));
        console.log(timeTable);
      }
    };

    loadPageData();
  }, [timeTableID]);

  if (isLoading) {
    return (
      <div className="loader_container">
        <Loader />
      </div>
    );
  }

  if (error == 404) {
    return (
      <div className={styles.timeTableView}>
        <Navbar />
        <div className={styles.mainPanelPlaceholder}>
          <div className={styles.mainPanel}>
            <ErrorLoadingStates state="error" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timeTableView}>
      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <div className={styles.mainPanel}>
          <TopbarLite />
          <div className={styles.mainPanel__headings}>
            <h2>{timeTable.name}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTableView;
