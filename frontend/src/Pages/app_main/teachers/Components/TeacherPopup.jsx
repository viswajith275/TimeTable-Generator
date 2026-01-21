import styles from "./TeacherPopup.module.css";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const TeacherPopup = ({ popUpClose, isPopupOpen, addTeacher }) => {
  const [errors, setErrors] = useState({
    teacherName: "",
    maxPeriods: "",
  });

  const [errorStates, setErrorStates] = useState({
    teacherName: false,
    maxPeriods: false,
  });

  const [teacherName, setTeacherName] = useState("");
  const [maxPeriods, setMaxPeriods] = useState("1");

  const closeBtnClickHandler = () => {
    setTeacherName("");
    setMaxPeriods("1");
    setErrors({
      teacherName: "",
      maxPeriods: "",
    });
    setErrorStates({
      teacherName: false,
      maxPeriods: false,
    });

    popUpClose();
  };

  const addBtnClickHandler = async (hasRetried = false) => {
    let hasError = false;
    const newErrors = {};
    const newErrorStates = {};

    if (!teacherName.trim()) {
      newErrors.teacherName = "Teacher name is required.";
      newErrorStates.teacherName = true;
      hasError = true;
    } else if (teacherName.length > 30) {
      newErrors.teacherName = "Teacher name must be under 30 characters.";
      newErrorStates.teacherName = true;
      hasError = true;
    } else {
      newErrorStates.teacherName = false;
    }

    const maxPeriodsNum = Number(maxPeriods);

    if (!maxPeriods.trim()) {
      newErrors.maxPeriods = "Maximum periods is required.";
      newErrorStates.maxPeriods = true;
      hasError = true;
    } else if (Number.isNaN(maxPeriodsNum)) {
      newErrors.maxPeriods = "Maximum periods must be a valid number.";
      newErrorStates.maxPeriods = true;
      hasError = true;
    } else if (maxPeriodsNum < 1) {
      newErrors.maxPeriods = "Maximum periods must be at least 1.";
      newErrorStates.maxPeriods = true;
      hasError = true;
    } else {
      newErrorStates.maxPeriods = false;
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);

    if (hasError) return;

    // backend integration here
    try {
      const payload = {
        t_name: teacherName,
        max_classes: maxPeriodsNum,
      };
      const { data } = await axios.post("/api/teachers", payload);
      addTeacher(data);
      toast.success("Teacher added successfully");
    } catch (err) {
      if (err?.response?.status == 401 && !hasRetried) {
        await refreshToken();
        await addBtnClickHandler(true);
        return;
      }
      toast.error("Failed to add teacher details!");
    }
  };

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Teacher Details</h4>
          <button onClick={closeBtnClickHandler}>
            <X />
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.inputContainer}>
            <label htmlFor="teacher-name-input">
              <p>Teacher Name</p>
              <p
                className={`${styles.errorText} ${
                  errorStates.teacherName ? "" : "hidden"
                }`}
              >
                {errors.teacherName}
              </p>
            </label>
            <input
              className={errorStates.teacherName ? styles.errorField : ""}
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              type="text"
              placeholder="Enter teacher name"
              id="teacher-name-input"
            />
          </div>

          <div className={styles.inputContainer}>
            <label htmlFor="max-periods-input">
              <p>Maximum periods per week</p>
              <p
                className={`${styles.errorText} ${
                  errorStates.maxPeriods ? "" : "hidden"
                }`}
              >
                {errors.maxPeriods}
              </p>
            </label>
            <input
              className={errorStates.maxPeriods ? styles.errorField : ""}
              value={maxPeriods}
              onChange={(e) => setMaxPeriods(e.target.value)}
              type="number"
              min="1"
              placeholder="Enter maximum periods"
              id="max-periods-input"
            />
          </div>
        </div>

        <div className={styles.actionBtns}>
          <button className={styles.btnItem} onClick={closeBtnClickHandler}>
            Cancel
          </button>
          <button
            className={`${styles.btnItem} ${styles.saveBtn}`}
            onClick={() => addBtnClickHandler(false)}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPopup;
