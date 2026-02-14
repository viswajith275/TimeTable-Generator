import { useEffect, useRef, useState } from "react";
import styles from "./TimeTableSubjectItem.module.css";
import { X, Check } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../../../../../Context/AuthProvider";
const TimeTableSubjectItem = ({ subject, subjectColorMap, editEntry }) => {
  const { refreshToken } = useAuth();
  const isFreePeriod = !subject?.id;
  const [editMode, setEditMode] = useState(false);
  const [isValidForSubmit, setIsValidForSubmit] = useState(false);
  const [formValue, setFormValue] = useState({
    subject: subject?.subject || "Free Period",
    teacher: subject?.teacher_name || "",
    roomName: subject?.room_name || "",
  });
  const actionBtnSize = 18;

  const subjectInputRef = useRef(null);

  //reset data
  useEffect(() => {
    setFormValue({
      subject: subject?.subject || "Free Period",
      teacher: subject?.teacher_name || "",
      roomName: subject?.room_name || "",
    });
    setEditMode(false);
  }, [subject]);

  //auto focus
  useEffect(() => {
    if (editMode) {
      subjectInputRef.current.focus();
    }
  }, [editMode]);

  //validatation
  useEffect(() => {
    if (isFreePeriod) return;

    const subjectValue = formValue.subject.trim();
    const teacherValue = formValue.teacher.trim();
    const roomValue = formValue.roomName.trim();

    const hasChanges =
      subjectValue !== subject.subject ||
      teacherValue !== subject.teacher_name ||
      roomValue !== subject.room_name;

    const isValid =
      subjectValue.length > 0 &&
      teacherValue.length > 0 &&
      roomValue.length > 0;

    setIsValidForSubmit(hasChanges && isValid);
  }, [formValue, subject]);

  const cancelBtnClickHandler = () => {
    setEditMode(false);
    setFormValue({
      subject: subject?.subject || "Free Period",
      teacher: subject?.teacher_name || "",
      roomName: subject?.room_name || "",
    });
  };

  const handleSubmit = async (e, hasRetried = false) => {
    e.preventDefault();
    if (!isValidForSubmit) return;
    console.log(subject);

    const payload = {
      subject: formValue.subject,
      teacher_name: formValue.teacher,
      room_name: formValue.roomName,
    };

    try {
      await axios.put(`/api/entries/${subject.id}`, payload);
      editEntry({ ...payload, id: subject.id });
    } catch (error) {
      const status = error?.response?.status;
      console.log(error);
      if (status == 401 && !hasRetried) {
        await refreshToken();
        return await handleSubmit(e, true);
      }
      toast.error("Failed to edit");
    } finally {
      setEditMode(false);
    }
  };

  if (editMode) {
    return (
      <div
        className={styles.editItem}
        style={{
          backgroundColor: subjectColorMap[subject?.subject] || "#E5E7EB",
          opacity: 0.7,
          color: subject ? "#fff" : "#6B7280",
        }}
      >
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <input
            type="text"
            ref={subjectInputRef}
            placeholder="Edit class name"
            value={formValue.subject}
            onChange={(e) =>
              setFormValue((prev) => ({ ...prev, subject: e.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Edit teacher name"
            value={formValue.teacher}
            onChange={(e) =>
              setFormValue((prev) => ({ ...prev, teacher: e.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Edit room name"
            value={formValue.roomName}
            onChange={(e) =>
              setFormValue((prev) => ({ ...prev, roomName: e.target.value }))
            }
          />

          <button type="submit" hidden />
        </form>

        <div className={styles.actionBtnContainer}>
          <X
            size={actionBtnSize}
            className={styles.actionBtn}
            onClick={cancelBtnClickHandler}
          ></X>

          <Check
            style={{
              cursor: isValidForSubmit ? "pointer" : "not-allowed",
              color: isValidForSubmit
                ? "var(--color-success)"
                : "var(--color-grey-300)",
            }}
            size={actionBtnSize}
            className={styles.actionBtn}
            onClick={handleSubmit}
          ></Check>
        </div>
      </div>
    );
  } else {
    //default view mode
    return (
      <div
        className={styles.subItem}
        style={{
          backgroundColor: subjectColorMap[subject?.subject] || "#E5E7EB",
          color: subject ? "#fff" : "#6B7280",
        }}
        onClick={() => {
          if (!isFreePeriod) setEditMode(true);
        }}
      >
        <p className={styles.subjectName__rowItem}>{formValue?.subject}</p>
        <p className={styles.teacherName__rowItem}>{formValue?.teacher}</p>
        <p className={styles.roomName__rowItem}>{formValue?.roomName}</p>
      </div>
    );
  }
};

export default TimeTableSubjectItem;
