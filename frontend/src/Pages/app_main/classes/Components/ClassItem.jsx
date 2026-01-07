import styles from "./ClassItem.module.css";
import { Pen, Trash2 } from "lucide-react";

const ClassItem = ({ roomName, roomNumber }) => {
  let sizeActionItems = 18;
  return (
    <div className={styles.classItem}>
      <div className={styles.itemHeading}>
        <h3>{roomName}</h3>
        <div className={styles.actionBtns}>
          <button className={styles.actionBtn__Item}>
            <Pen size={sizeActionItems} />
          </button>

          <button className={`${styles.actionBtn__Item} ${styles.deleteBtn}`}>
            <Trash2 size={sizeActionItems} />
          </button>
        </div>
      </div>
      <p>{roomNumber}</p>
    </div>
  );
};

export default ClassItem;
