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
  const [maxPerWeek, setMaxPerWeek] = useState("");
  const [maxPerDay, setMaxPerDay] = useState("");
  const [maxConsecutive, setMaxConsecutive] = useState("");

  const [errors, setErrors] = useState({
    teacherName: "",
    maxPerWeek: "",
    maxPerDay: "",
    maxConsecutive: "",
  });

  const [errorStates, setErrorStates] = useState({
    teacherName: false,
    maxPerWeek: false,
    maxPerDay: false,
    maxConsecutive: false,
  });

  useEffect(() => {
    if (!initialData) return;

    setTeacherName(initialData.t_name ?? "");
    setMaxPerWeek(String(initialData.max_per_week ?? ""));
    setMaxPerDay(
      initialData.max_per_day !== null ? String(initialData.max_per_day) : "",
    );
    setMaxConsecutive(
      initialData.max_consecutive_class !== null
        ? String(initialData.max_consecutive_class)
        : "",
    );
  }, [initialData, isPopupOpen]);

  const isChanged = useMemo(() => {
    if (!initialData) return false;

    if (targetElm === "name") {
      return teacherName.trim() !== initialData.t_name;
    }

    if (targetElm === "max_per_week") {
      return Number(maxPerWeek) !== initialData.max_per_week;
    }

    if (targetElm === "max_per_day") {
      return Number(maxPerDay || null) !== (initialData.max_per_day ?? null);
    }

    if (targetElm === "max_consecutive_class") {
      return (
        Number(maxConsecutive || null) !==
        (initialData.max_consecutive_class ?? null)
      );
    }

    return false;
  }, [
    teacherName,
    maxPerWeek,
    maxPerDay,
    maxConsecutive,
    targetElm,
    initialData,
  ]);

  const closeHandler = () => {
    setErrors({
      teacherName: "",
      maxPerWeek: "",
      maxPerDay: "",
      maxConsecutive: "",
    });
    setErrorStates({
      teacherName: false,
      maxPerWeek: false,
      maxPerDay: false,
      maxConsecutive: false,
    });
    popUpClose();
  };

  const validate = () => {
    let hasError = false;
    const newErrors = {};
    const newErrorStates = {};

    const validateNumber = (val, key, label, optional = false) => {
      if (optional && val === "") return;
      const num = Number(val);
      if (Number.isNaN(num) || num < 1) {
        newErrors[key] = `${label} must be at least 1`;
        newErrorStates[key] = true;
        hasError = true;
      }
    };

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

    if (targetElm === "max_per_week") {
      validateNumber(maxPerWeek, "maxPerWeek", "Max classes per week");
    }

    if (targetElm === "max_per_day") {
      validateNumber(maxPerDay, "maxPerDay", "Max classes per day", true);
    }

    if (targetElm === "max_consecutive_class") {
      validateNumber(
        maxConsecutive,
        "maxConsecutive",
        "Max consecutive classes",
        true,
      );
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);

    return !hasError;
  };

  const editHandler = async (hasRetried = false) => {
    if (!validate()) return;
    if (!isChanged) return;

    const payload = {
      t_name: initialData.t_name,
      max_per_week: initialData.max_per_week,
      max_per_day: initialData.max_per_day,
      max_consecutive_class: initialData.max_consecutive_class,
    };

    if (targetElm === "name") payload.t_name = teacherName.trim();
    if (targetElm === "max_per_week") payload.max_per_week = Number(maxPerWeek);
    if (targetElm === "max_per_day")
      payload.max_per_day = maxPerDay === "" ? null : Number(maxPerDay);
    if (targetElm === "max_consecutive_class")
      payload.max_consecutive_class =
        maxConsecutive === "" ? null : Number(maxConsecutive);

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
              />
            </div>
          )}

          {targetElm === "max_per_week" && (
            <div className={styles.inputContainer}>
              <label>
                <p>Max Classes Per Week</p>
                <p
                  className={`${styles.errorText} ${
                    errorStates.maxPerWeek ? "" : "hidden"
                  }`}
                >
                  {errors.maxPerWeek}
                </p>
              </label>
              <input
                value={maxPerWeek}
                onChange={(e) => setMaxPerWeek(e.target.value)}
                className={errorStates.maxPerWeek ? styles.errorField : ""}
                type="number"
                min="1"
              />
            </div>
          )}

          {targetElm === "max_per_day" && (
            <div className={styles.inputContainer}>
              <label>
                <p>Max Classes Per Day (Optional)</p>
                <p
                  className={`${styles.errorText} ${
                    errorStates.maxPerDay ? "" : "hidden"
                  }`}
                >
                  {errors.maxPerDay}
                </p>
              </label>
              <input
                value={maxPerDay}
                onChange={(e) => setMaxPerDay(e.target.value)}
                className={errorStates.maxPerDay ? styles.errorField : ""}
                type="number"
                min="1"
              />
            </div>
          )}

          {targetElm === "max_consecutive_class" && (
            <div className={styles.inputContainer}>
              <label>
                <p>Max Consecutive Classes (Optional)</p>
                <p
                  className={`${styles.errorText} ${
                    errorStates.maxConsecutive ? "" : "hidden"
                  }`}
                >
                  {errors.maxConsecutive}
                </p>
              </label>
              <input
                value={maxConsecutive}
                onChange={(e) => setMaxConsecutive(e.target.value)}
                className={errorStates.maxConsecutive ? styles.errorField : ""}
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
