import styles from "./ClassItem.module.css";
import { Pen, Trash2, X, Check } from "lucide-react";
import axios from "axios";
import { useState } from "react";

const ClassItem = ({ roomName, roomNumber, id, deleteClass, editClass }) => {
  // resorting to snake case to try and match the backend api thingy
  const [formData, setFormData] = useState({
    c_name: roomName,
    r_name: roomNumber,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  let sizeActionItems = 18;
  // using this for trimming instead of using .trim everywhere..
  const normalize = (value) => value.trim();
  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(`/api/classes/${id}`);
      console.log(data);
      deleteClass(id);
    } catch (err) {
      console.log(err);
    }
  };
  const handleSave = async () => {
    try {
      const payload = {
        c_name: normalize(formData.c_name),
        r_name: normalize(formData.r_name),
      };
      const { data } = await axios.put(`/api/classes/${id}`, payload);
      editClass(data);
      setIsEditMode(false);
    } catch (error) {
      console.log(error);
    }
  };
  //while cancelling we reset formdata also make edit mode false
  const handleCancel = () => {
    setFormData({
      c_name: roomName,
      r_name: roomNumber,
    });
    setIsEditMode(false);
  };

  //these three variables validates edit mode..
  const isNotChanged =
    normalize(formData.c_name) !== normalize(roomName) ||
    normalize(formData.r_name) !== normalize(roomNumber);

  const isValid =
    formData.c_name.trim().length > 0 &&
    formData.r_name.trim().length > 0 &&
    formData.c_name.length <= 30 &&
    formData.r_name.length <= 30;
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

  //edit mode part
  if (isEditMode) {
    return (
      <div className={styles.classItem}>
        <div className={styles.itemHeading}>
          <input
            type="text"
            onKeyDown={handleKeyDown}
            placeholder="Edit class name"
            value={formData.c_name}
            onChange={(e) => {
              setFormData({ ...formData, c_name: e.target.value });
            }}
          />
          <div className={styles.actionBtns}>
            <button className={styles.actionBtn__Item} onClick={handleCancel}>
              <X size={sizeActionItems} />
            </button>

            <button
              disabled={!canSave}
              onClick={handleSave}
              className={`${styles.actionBtn__Item} ${styles.tickBtn}`}
            >
              <Check size={sizeActionItems} />
            </button>
          </div>
        </div>
        <input
          type="text"
          onKeyDown={handleKeyDown}
          placeholder="Edit room number"
          value={formData.r_name}
          onChange={(e) => {
            setFormData({ ...formData, r_name: e.target.value });
          }}
        />
      </div>
    );
  }
  //main box item
  return (
    <div className={styles.classItem}>
      <div className={styles.itemHeading}>
        <h3>{roomName}</h3>
        <div className={styles.actionBtns}>
          <button
            className={styles.actionBtn__Item}
            onClick={() => {
              setIsEditMode(true);
            }}
          >
            <Pen size={sizeActionItems} />
          </button>

          <button
            className={`${styles.actionBtn__Item} ${styles.deleteBtn}`}
            onClick={handleDelete}
          >
            <Trash2 size={sizeActionItems} />
          </button>
        </div>
      </div>
      <p>{roomNumber}</p>
    </div>
  );
};

export default ClassItem;
