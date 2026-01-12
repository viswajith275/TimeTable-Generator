import styles from "./Mobile.module.css";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const MobileNav = ({ closeNav, isNavOpen }) => {
  const navigate = useNavigate();
  //this is used to hide body scrolling when navbar is option
  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "auto";
  }, [isNavOpen]);

  const linkClickHandler = (url) => {
    navigate(url);
    closeNav();
  };
  return (
    <div
      className={`${styles.mobileNavPlaceholder} ${
        isNavOpen ? styles.open : ""
      }`}
      onClick={closeNav}
    >
      <div className={styles.navMain}>
        <div className={styles.links} onClick={(e) => e.stopPropagation()}>
          <p
            className={styles.linkItem}
            onClick={() => {
              linkClickHandler("/dashboard");
            }}
          >
            Dashboard
          </p>
          <p
            className={styles.linkItem}
            onClick={() => {
              linkClickHandler("/classes");
            }}
          >
            Classrooms
          </p>
          <p className={styles.linkItem}>Subjects</p>
          <p
            className={styles.linkItem}
            onClick={() => {
              linkClickHandler("/teachers");
            }}
          >
            Teachers
          </p>
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
