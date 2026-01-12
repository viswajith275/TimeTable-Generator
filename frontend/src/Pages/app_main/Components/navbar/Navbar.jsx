import styles from "./Navbar.module.css";
import {
  LayoutDashboard,
  School,
  LibraryBig,
  SquareUserRound,
  Settings,
} from "lucide-react";

import logoSmall from "../../../../assets/logo_small.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.navBar}>
      <img src={logoSmall} width={50} alt="" />
      <div className={styles.linkContainer}>
        <div className={styles.linkGroups}>
<<<<<<< HEAD
          <div className={`${styles.linkItem} ${styles.selected}`}>
=======
          <div
            className={styles.linkItem}
            onClick={() => {
              navigate("/dashboard");
            }}
          >
>>>>>>> 6a37c97 (added basic routing : tofix flickering)
            <LayoutDashboard /> <p>Dashboard</p>
          </div>

          <div
            className={styles.linkItem}
            onClick={() => {
              navigate("/classes");
            }}
          >
            <School /> <p>Classrooms</p>
          </div>

          <div className={styles.linkItem}>
            <LibraryBig /> <p>Subjects</p>
          </div>

          <div
            className={styles.linkItem}
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
