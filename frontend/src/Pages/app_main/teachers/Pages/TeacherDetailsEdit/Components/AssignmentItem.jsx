import styles from "./AssignmentItem.module.css";
import { Trash2, SquarePen } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../../../Context/AuthProvider";
import { toast } from "react-toastify";

const AssignmentItem = ({ subject, className, role, id, onDelete }) => {
  const actionItemSize = 20;
  const { refreshToken } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const deleteAssignment = async (hasRetried = false) => {
    if (deleting) return;

    try {
      setDeleting(true);

      await axios.delete(`/api/assignments/${id}`);

      toast.success("Assignment deleted");
      onDelete?.(id); // optimistic UI update (if provided)
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401 && !hasRetried) {
        await refreshToken();
        return deleteAssignment(true);
      }

      toast.error(
        err?.response?.data?.message ||
          "Failed to delete assignment. Please try again.",
      );
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.assignment}>
      <div className={styles.mainContainer}>
        <div className={styles.info}>
          <p>{className}</p>
          <h4>{subject}</h4>
        </div>

        <div className={styles.actionItems}>
          <button className={styles.editBtn}>
            <SquarePen size={actionItemSize} />
          </button>

          <button
            className={styles.deleteBtn}
            onClick={deleteAssignment}
            disabled={deleting}
          >
            <Trash2 size={actionItemSize} />
          </button>
        </div>
      </div>

      <div className={styles.teacherRole}>
        <p>{role}</p>
      </div>
    </div>
  );
};

export default AssignmentItem;
