import Navbar from "../Components/navbar/Navbar";
import styles from "./Dashboard.module.css";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import TableItem from "./Components/TableItem/TableItem";
import Filter from "../Components/filter/Filter";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorLoadingStates from "../Components/ErrorLoadingStates/ErrorLoadingStates";
import axios from "axios";
import { useAuth } from "../../../Context/AuthProvider";
const Dashboard = () => {
  const { refreshToken } = useAuth();
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [isTimetableLoading, setIsTimetableLoading] = useState(true);
  useEffect(() => {
    const fetchAllTimeTables = async (hasRetried = false) => {
      const start = Date.now();
      const MIN_TIME = 500;

      try {
        const { data } = await axios.get("/api/timetables");
        console.log(data);
        setTimetables(data);
      } catch (error) {
        if (error?.response?.status === 401 && !hasRetried) {
          await refreshToken();
          return fetchAllTimeTables(true);
        }
      } finally {
        const elapsed = Date.now() - start;
        setTimeout(
          () => {
            setIsTimetableLoading(false);
          },
          Math.max(MIN_TIME - elapsed, 0),
        );
      }
    };

    fetchAllTimeTables();
  }, []);
  const deleteTableItem = (id) => {
    setTimetables((prev) => prev.filter((item) => item.timetable_id != id));
  };
  return (
    <div className={styles.dashBoard}>
      <Navbar></Navbar>
      <div className={styles.mainPanelPlaceholder}>
        <Topbar></Topbar>
        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <div>
              <h2>Dashboard</h2>
              <p>Create and manage timetables.</p>
            </div>

            <button
              className={styles.createBtn}
              onClick={() => navigate("/dashboard/timetables/create")}
            >
              <Plus />
              <p>Create New</p>
            </button>
          </div>

          <div className={styles.utilityPanel}>
            <Filter></Filter>
          </div>

          <div className={styles.tablesPlaceholder}>
            {isTimetableLoading ? (
              <ErrorLoadingStates state={"loading"} />
            ) : (
              Object.values(timetables).map((value, index) => (
                <TableItem
                  key={index}
                  id={value.timetable_id}
                  tableName={value.timetable_name}
                  deleteTable={deleteTableItem}
                />
              ))
            )}

            {Object.values(timetables).length == 0 && !isTimetableLoading ? (
              <ErrorLoadingStates
                listName={"Time tables"}
                btnName={"Create New"}
                state={"empty"}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
