import styles from "./TeacherAssignPopup.module.css";
import { X } from "lucide-react";
const TeacherAssignPopup = ({ popUpClose, isPopupOpen }) => {
  const closeBtnClickHandler = () => {
    popUpClose();
  };
  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Assignment</h4>
          <button type="button" onClick={closeBtnClickHandler}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignPopup;
