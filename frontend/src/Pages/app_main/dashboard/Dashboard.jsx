import Navbar from "../Components/navbar/Navbar";
import styles from "./Dashboard.module.css";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import TableItem from "./Components/TableItem/TableItem";
import Filter from "../Components/filter/Filter";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
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
            <TableItem></TableItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
