import styles from "./Navbar.module.css";
import {
  LayoutDashboard,
  School,
  LibraryBig,
  SquareUserRound,
  Settings,
} from "lucide-react";

import logoSmall from "../../../../assets/logo_small.png";
const Navbar = () => {
  return (
    <div className={styles.navBar}>
      <img src={logoSmall} width={50} alt="" />
      <div className={styles.linkContainer}>
        <div className={styles.linkGroups}>
          <div className={`${styles.linkItem} ${styles.selected}`}>
            <LayoutDashboard /> <p>Dashboard</p>
          </div>

          <div className={styles.linkItem}>
            <School /> <p>Classrooms</p>
          </div>

          <div className={styles.linkItem}>
            <LibraryBig /> <p>Subjects</p>
          </div>

          <div className={styles.linkItem}>
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
