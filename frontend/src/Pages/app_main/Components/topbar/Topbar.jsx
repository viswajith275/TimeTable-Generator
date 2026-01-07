import styles from "./Topbar.module.css";
import { Search, UserRound, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import MobileNav from "../mobileNavbar/MobileNav";

const Topbar = () => {
  const [mobileNavShown, setMobileNavShown] = useState(false);
  return (
    <div className={styles.topbar}>
      <MobileNav
        isNavOpen={mobileNavShown}
        closeNav={() => setMobileNavShown(false)}
      />

      <div
        className={styles.hamBurgerIcon}
        onClick={() => setMobileNavShown(true)}
      >
        <Menu />
      </div>
      <div className={styles.inputContainer}>
        <div className={styles.inputField}>
          <Search size={16} strokeWidth={1.75} />

          <input type="text" placeholder="Search" />
        </div>
      </div>

      <div className={styles.profile}>
        <UserRound size={20} />
        <p>Profile Name</p>
        <ChevronDown size={18} />
      </div>
    </div>
  );
};

export default Topbar;
