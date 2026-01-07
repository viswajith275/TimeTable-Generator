import styles from "./ClassDetails.module.css";
import { X } from "lucide-react";
const ClassDetailsPopup = ({ popUpClose, isPopupOpen }) => {
  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Classroom</h4>
          <button onClick={popUpClose}>
            <X></X>
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.inputContainer}>
            {" "}
            <label htmlFor="class-name-entry-wa901">
              <p>Class Name</p>

              <p className={styles.errorText}>Cannot be empty</p>
            </label>
            <input
              type="text"
              placeholder="Enter class name"
              id="class-name-entry-wa901"
            />
          </div>

          <div className={styles.inputContainer}>
            {" "}
            <label htmlFor="class-no-entry-wa902">
              <p>Room number</p>

              <p className={styles.errorText}>Cannot be empty</p>
            </label>
            <input
              type="text"
              placeholder="Enter Room number"
              id="class-no-entry-wa902"
            />
          </div>
        </div>

        <div className={styles.actionBtns}>
          <button className={styles.btnItem} onClick={popUpClose}>
            Cancel
          </button>
          <button className={`${styles.btnItem} ${styles.saveBtn}`}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsPopup;
