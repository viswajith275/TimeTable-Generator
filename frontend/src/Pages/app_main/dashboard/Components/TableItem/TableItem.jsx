import styles from "./TableItem.module.css";
import { Eye, SquarePen, Download, Trash2, ChevronRight } from "lucide-react";
const TableItem = () => {
  let sizeActionItems = 20;
  return (
    <div className={styles.tableItemContainer}>
      <div className={styles.headingPanel}>
        <h4>Time-Table-2025-6Aw1</h4>
        <div className={styles.actionBtns}>
          <button className={styles.actionBtn__Item}>
            <Eye size={sizeActionItems} />
          </button>
          <button className={styles.actionBtn__Item}>
            <SquarePen size={sizeActionItems} />
          </button>
          <button className={styles.actionBtn__Item}>
            <Download size={sizeActionItems} />
          </button>
          <button className={`${styles.actionBtn__Item} ${styles.deleteBtn}`}>
            <Trash2 size={sizeActionItems} />
          </button>
        </div>
      </div>
      <div className={styles.progressBarItemContainer}></div>
      <div className={styles.viewDetailsBtn}>
        <p>View Details</p>
        <ChevronRight strokeWidth={3} size={15} />
      </div>
    </div>
  );
};

export default TableItem;
