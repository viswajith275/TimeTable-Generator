import styles from "./TopbarLite.module.css";
import ProfileDropDown from "../dropdown/profileDropdown/ProfileDropdown";
import { ChevronLeft, UserRound, ChevronDown } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../../../Context/AuthProvider";
import { useNavigate } from "react-router-dom";

const TopbarLite = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
      <div className={styles.backBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={18} />
        <p>Go back</p>
      </div>

      <div
        className={styles.profile}
        ref={menuRef}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        <UserRound size={20} />
        <p>{user}</p>
        <ChevronDown size={18} />

        <ProfileDropDown isOpen={open}></ProfileDropDown>
      </div>
    </div>
  );
};

export default TopbarLite;
