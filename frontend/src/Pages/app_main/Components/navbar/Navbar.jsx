import styles from "./Navbar.module.css";
import {
  LayoutDashboard,
  School,
  LibraryBig,
  SquareUserRound,
  Settings,
} from "lucide-react";

import logoSmall from "../../../../assets/logo_small.png";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "");

  return (
    <div className={styles.navBar}>
      <img src={logoSmall} width={50} alt="" />
      <div className={styles.linkContainer}>
        <div className={styles.linkGroups}>
          <div
            className={`${styles.linkItem} ${
              currentPath.startsWith("dashboard") || currentPath.trim() === ""
                ? styles.selected
                : ""
            }`}
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            <LayoutDashboard /> <p>Dashboard</p>
          </div>

          <div
            className={`${styles.linkItem} ${
              currentPath.startsWith("classes") ? styles.selected : ""
            }`}
            onClick={() => {
              navigate("/classes");
            }}
          >
            <School /> <p>Classrooms</p>
          </div>

          <div
            className={`${styles.linkItem} ${
              currentPath.startsWith("subjects") ? styles.selected : ""
            }`}
            onClick={() => {
              navigate("/subjects");
            }}
          >
            <LibraryBig /> <p>Subjects</p>
          </div>

          <div
            className={`${styles.linkItem} ${
              currentPath.startsWith("teacher") ? styles.selected : ""
            }`}
            onClick={() => {
              navigate("/teachers");
            }}
          >
            <SquareUserRound /> <p>Teachers</p>
          </div>
        </div>

        <div className={styles.linkItem}>
          <Settings /> <p>Settings</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
