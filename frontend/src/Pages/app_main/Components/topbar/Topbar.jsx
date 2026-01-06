import styles from "./Topbar.module.css";
import { Search, UserRound, ChevronDown } from "lucide-react";
const Topbar = () => {
  return (
    <div className={styles.topbar}>
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
