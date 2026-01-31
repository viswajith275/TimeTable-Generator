import styles from "./EditTeachersPopup.module.css";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const EditTeachersPopup = ({
  popUpClose,
  isPopupOpen,
  targetElm,
  initialData,
  updateMain,
}) => {
  const [teacherName, setTeacherName] = useState("");
  const [maxPeriods, setMaxPeriods] = useState("");

  const [errors, setErrors] = useState({
    teacherName: "",
    maxPeriods: "",
  });

  const [errorStates, setErrorStates] = useState({
    teacherName: false,
    maxPeriods: false,
  });

  useEffect(() => {
    if (!initialData) return;

    setTeacherName(initialData.t_name ?? "");
    setMaxPeriods(String(initialData.max_classes ?? ""));
  }, [initialData, isPopupOpen]);

  const isChanged = useMemo(() => {
    if (!initialData) return false;

    if (targetElm === "name") {
      return teacherName.trim() !== initialData.t_name;
    }

    if (targetElm === "max_classes") {
      return Number(maxPeriods) !== initialData.max_classes;
    }

    return false;
  }, [teacherName, maxPeriods, targetElm, initialData]);

  const closeHandler = () => {
    setErrors({ teacherName: "", maxPeriods: "" });
    setErrorStates({ teacherName: false, maxPeriods: false });
    popUpClose();
  };

  const validate = () => {
    let hasError = false;
    const newErrors = {};
    const newErrorStates = {};

    if (targetElm === "name") {
      if (!teacherName.trim()) {
        newErrors.teacherName = "Teacher name is required.";
        newErrorStates.teacherName = true;
        hasError = true;
      } else if (teacherName.length > 30) {
        newErrors.teacherName = "Teacher name must be under 30 characters.";
        newErrorStates.teacherName = true;
        hasError = true;
      }
    }

    if (targetElm === "max_classes") {
      const num = Number(maxPeriods);

      if (!maxPeriods.trim()) {
        newErrors.maxPeriods = "Maximum periods is required.";
        newErrorStates.maxPeriods = true;
        hasError = true;
      } else if (Number.isNaN(num) || num < 1) {
        newErrors.maxPeriods = "Enter a valid number (min 1).";
        newErrorStates.maxPeriods = true;
        hasError = true;
      }
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);

    return !hasError;
  };

  const editHandler = async (hasRetried = false) => {
    if (!validate()) return;

    if (!isChanged) return;

    const payload = {
      t_name: targetElm === "name" ? teacherName.trim() : initialData.t_name,
      max_classes:
        targetElm === "max_classes"
          ? Number(maxPeriods)
          : initialData.max_classes,
    };

    try {
      const { data } = await axios.put(
        `/api/teachers/${initialData.id}`,
        payload,
      );

      updateMain(data);
      toast.success("Teacher updated successfully");
      popUpClose();
    } catch (err) {
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await editHandler(true);
        return;
      }
      toast.error("Failed to update teacher details");
    }
  };

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Edit Details</h4>
          <button onClick={closeHandler}>
            <X />
          </button>
        </div>

        <div className={styles.formContainer}>
          {targetElm === "name" && (
            <div className={styles.inputContainer}>
              <label>
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
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className={errorStates.teacherName ? styles.errorField : ""}
                type="text"
                placeholder="Enter teacher name"
              />
            </div>
          )}

          {targetElm === "max_classes" && (
            <div className={styles.inputContainer}>
              <label>
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
                value={maxPeriods}
                onChange={(e) => setMaxPeriods(e.target.value)}
                className={errorStates.maxPeriods ? styles.errorField : ""}
                type="number"
                min="1"
              />
            </div>
          )}
        </div>

        <div className={styles.actionBtns}>
          <button className={styles.btnItem} onClick={closeHandler}>
            Cancel
          </button>

          <button
            className={`${styles.btnItem} ${styles.saveBtn}`}
            disabled={!isChanged}
            style={{
              cursor: isChanged ? "pointer" : "not-allowed",
              opacity: isChanged ? 1 : 0.5,
            }}
            onClick={() => editHandler(false)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTeachersPopup;
