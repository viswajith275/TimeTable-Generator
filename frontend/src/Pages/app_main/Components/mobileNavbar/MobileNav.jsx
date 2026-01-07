import styles from "./Mobile.module.css";
import { X } from "lucide-react";
import { useEffect } from "react";
const MobileNav = ({ closeNav, isNavOpen }) => {
  //this is used to hide body scrolling when navbar is option
  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "auto";
  }, [isNavOpen]);
  return (
    <div
      className={`${styles.mobileNavPlaceholder} ${
        isNavOpen ? styles.open : ""
      }`}
      onClick={closeNav}
    >
      <div className={styles.navMain}>
        <div className={styles.links} onClick={(e) => e.stopPropagation()}>
          <p className={styles.linkItem}>Dashboard</p>
          <p className={styles.linkItem}>Classrooms</p>
          <p className={styles.linkItem}>Subjects</p>
          <p className={styles.linkItem}>Teachers</p>
          <p className={styles.linkItem}>Settings</p>
        </div>

        <div className={styles.closeBtn} onClick={closeNav}>
          <X size={30}></X>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
