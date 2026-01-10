import styles from "./Topbar.module.css";
import { Search, UserRound, ChevronDown, Menu } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import MobileNav from "../mobileNavbar/MobileNav";
import ProfileDropdown from "../dropdown/profileDropdown/profileDropdown";

const Topbar = () => {
  const [mobileNavShown, setMobileNavShown] = useState(false);
  const [open, setOpen] = useState(false);

  let menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  }, []);


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

      <div className={styles.profile} ref={menuRef} onClick={() => { setOpen(prev => !prev); }}>
        <UserRound size={20} />
        <p>Profile Name</p>
        <ChevronDown size={18} />

        <ProfileDropdown isOpen = {open}></ProfileDropdown>
      </div>
    </div>
  );
};

export default Topbar;
