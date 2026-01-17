import styles from "./SubjectItem.module.css";
import { Pen, Trash2, X, Check } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../../Context/AuthProvider";
import { useState } from "react";

const SubjectItem = ({
  subjectName,
  toughness,
  id,
  deleteSubject,
  editSubject,
}) => {
  const { refreshToken } = useAuth();

  // matching backend payload
  const [formData, setFormData] = useState({
    s_name: subjectName,
    toughness,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const sizeActionItems = 18;

  const normalize = (value) => value.trim();

  const handleDelete = async (hasRetried = false) => {
    try {
      await axios.delete(`/api/subjects/${id}`);
      deleteSubject(id);
    } catch (err) {
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await handleDelete(true);
      }
    }
  };

  const handleSave = async (hasRetried = false) => {
    try {
      const payload = {
        s_name: normalize(formData.s_name),
        toughness: formData.toughness,
      };

      const { data } = await axios.put(`/api/subjects/${id}`, payload);
      editSubject(data);
      setIsEditMode(false);
    } catch (error) {
      if (error?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await handleSave(true);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      s_name: subjectName,
      toughness,
    });
    setIsEditMode(false);
  };

  const isNotChanged =
    normalize(formData.s_name) !== normalize(subjectName) ||
    formData.toughness !== toughness;

  const isValid =
    formData.s_name.trim().length > 0 &&
    formData.s_name.length <= 30 &&
    ["easy", "medium", "hard"].includes(formData.toughness);

  const canSave = isNotChanged && isValid;

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canSave) await handleSave();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  /* ================= EDIT MODE ================= */

  if (isEditMode) {
    return (
      <div className={styles.subjectItem}>
        <div className={styles.itemHeading}>
          <input
            type="text"
            placeholder="Edit subject name"
            value={formData.s_name}
            onKeyDown={handleKeyDown}
            onChange={(e) =>
              setFormData({ ...formData, s_name: e.target.value })
            }
          />

          <div className={styles.actionBtns}>
            <button className={styles.actionBtn__Item} onClick={handleCancel}>
              <X size={sizeActionItems} />
            </button>

            <button
              disabled={!canSave}
              onClick={() => handleSave(false)}
              className={`${styles.actionBtn__Item} ${styles.tickBtn}`}
            >
              <Check size={sizeActionItems} />
            </button>
          </div>
        </div>

        <select
          value={formData.toughness}
          onKeyDown={handleKeyDown}
          onChange={(e) =>
            setFormData({ ...formData, toughness: e.target.value })
          }
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    );
  }

  /* ================= VIEW MODE ================= */

  return (
    <div className={styles.subjectItem}>
      <div className={styles.itemHeading}>
        <h3>{subjectName}</h3>

        <div className={styles.actionBtns}>
          <button
            className={styles.actionBtn__Item}
            onClick={() => setIsEditMode(true)}
          >
            <Pen size={sizeActionItems} />
          </button>

          <button
            className={`${styles.actionBtn__Item} ${styles.deleteBtn}`}
            onClick={() => handleDelete(false)}
          >
            <Trash2 size={sizeActionItems} />
          </button>
        </div>
      </div>

      <p className={styles.toughnessText}>
        {toughness.charAt(0).toUpperCase() + toughness.slice(1)}
      </p>
    </div>
  );
};

export default SubjectItem;
