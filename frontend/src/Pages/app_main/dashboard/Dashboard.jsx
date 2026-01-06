import Navbar from "../Components/navbar/Navbar";
import styles from "./Dashboard.module.css";
import Topbar from "../Components/topbar/Topbar";

import TableItem from "./Components/TableItem/TableItem";
const Dashboard = () => {
  return (
    <div className={styles.dashBoard}>
      <Navbar></Navbar>
      <div className={styles.mainPanelPlaceholder}>
        <Topbar></Topbar>
        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <h1>Welcome back !!</h1>
            <p>
              Easily manage and generate school timetables with our automatic
              timetable generator.
            </p>
          </div>

          <button className={styles.createBtn}>Create New</button>

          <div className={styles.tablesPlaceholder}>
            <TableItem></TableItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
