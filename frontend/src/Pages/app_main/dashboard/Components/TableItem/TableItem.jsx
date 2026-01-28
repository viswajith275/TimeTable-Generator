import styles from "./TableItem.module.css";
import { Eye, SquarePen, Download, Trash2, ChevronRight } from "lucide-react";
import { useAuth } from "../../../../../Context/AuthProvider";
import { toast } from "react-toastify";
import axios from "axios";
const TableItem = ({ id, tableName, deleteTable }) => {
  let sizeActionItems = 20;
  const { refreshToken } = useAuth();

  const handleDelete = async (hasRetried = false) => {
    try {
      await axios.delete(`api/timetables/${id}`);
      deleteTable(id);
    } catch (error) {
      if (error?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        return handleDelete(true);
      }

      toast.error("Failed to delete timetable.");
      console.log(error);
    }
  };
  return (
    <div className={styles.tableItemContainer}>
      <div className={styles.headingPanel}>
        <h4>{tableName}</h4>
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
          <button
            className={`${styles.actionBtn__Item} ${styles.deleteBtn}`}
            onClick={handleDelete}
          >
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
