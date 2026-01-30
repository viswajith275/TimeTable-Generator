import styles from "./SubjectItem.module.css";
import { SquarePen, Trash2, X, Check } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../../Context/AuthProvider";
import { useState } from "react";
import { toast } from "react-toastify";
import { ChevronRight } from "lucide-react";

const SubjectItem = ({
  subjectName,
  daily,
  weekly,
  consecutive,
  toughnessLevel,
  id,
  onRequestDelete,
  editSubject,
}) => {
  const { refreshToken } = useAuth();

  const [formData, setFormData] = useState({
    subjectName,
    dailyMin: daily.min,
    dailyMax: daily.max,
    weeklyMin: weekly.min,
    weeklyMax: weekly.max,
    consecutiveMin: consecutive.min,
    consecutiveMax: consecutive.max,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const sizeActionItems = 18;

  const normalize = (value) =>
    typeof value === "string" ? value.trim() : value;

  const handleDelete = async (hasRetried = false) => {
    try {
      const { data } = await axios.delete(`/api/subjects/${id}`);
      console.log(data);
      onRequestDelete(id);
    } catch (err) {
      console.log(err?.response?.status, hasRetried);
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await handleDelete(true);
      }
      toast.error("Failed to delete");
    }
  };

  const toughness = {
    "High" : "tough",
    "Med": "average",
    "Low": "easy"
  }

  return (
    <div className={styles.subjectItem}>
      <div className={styles.itemHeading}>
        <h3>{subjectName}</h3>
        <div className={styles.actionBtns}>
          <button
            className={styles.actionBtn__Item}
            onClick={() => setIsEditMode(true)}
          >
            <SquarePen size={sizeActionItems} />
          </button>
          <button
            className={`${styles.actionBtn__Item} ${styles.deleteBtn}`}
            onClick={() => onRequestDelete(id)}
          >
            <Trash2 size={sizeActionItems} />
          </button>
        </div>
      </div>
      <h4 
      className={styles.subjectDifficulty}>
        {toughness[toughnessLevel]}
      </h4>
      <div className={styles.viewDetails}>
        <p>See Details</p>
        <ChevronRight size={18} />
      </div>
    </div>
  );
};

export default SubjectItem;
