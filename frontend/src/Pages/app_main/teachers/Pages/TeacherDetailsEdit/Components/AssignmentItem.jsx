import styles from "./AssignmentItem.module.css";
import { Trash2, SquarePen } from "lucide-react";

const AssignmentItem = () => {
  const actionItemSize = 20;
  return (
    <div className={styles.assignment}>
      <div className={styles.mainContainer}>
        <div className={styles.info}>
          <p>7A</p>
          <h4>Mathematics</h4>
        </div>
        <div className={styles.actionItems}>
          <button className={styles.editBtn}>
            <SquarePen size={actionItemSize} />
          </button>
          <button className={styles.deleteBtn}>
            <Trash2 size={actionItemSize} />
          </button>
        </div>
      </div>
      <div className={styles.teacherRole}>
        <p>Primary Teacher</p>
      </div>
    </div>
  );
};

export default AssignmentItem;
