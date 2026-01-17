import styles from "./TeacherPopup.module.css";
import { useState } from "react";
import { X } from "lucide-react";
const TeacherPopup = ({ popUpClose, isPopupOpen }) => {
  const [errors, setErrors] = useState({
    teacherName: "",
    maxPeriods: "",
  });

  const [errorStates, setErrorStates] = useState({
    teacherName: false,
    maxPeriods: false,
  });
  //two way binding stuff
  const [teacherName, setTeacherName] = useState("");
  const [maxPeriods, setMaxPeriods] = useState("");

  //clic handlers

  const closeBtnClickHandler = () => {
    // reseting all data once the user clicks close/cancel
    // otherwise it is retained when user clicks and reopens the prompt..
    setTeacherName("");
    setMaxPeriods("");
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

  const addBtnClickHandler = () => {
    let hasError = false;
    const newErrors = { ...errors };
    const newErrorStates = { ...errorStates };

    //classname validation
    if (!teacherName.trim()) {
      newErrors.teacherName = "Teacher Name is required";
      newErrorStates.teacherName = true;
      hasError = true;
    } else if (teacherName.length > 15) {
      newErrors.teacherName = "Maximum length is 30 characters.";
      newErrorStates.teacherName = true;
      hasError = true;
    } else {
      newErrorStates.teacherName = false;
    }

    //maxPeriods validation
    if (!maxPeriods.trim()) {
      newErrors.maxPeriods = "Max periods is required";
      newErrorStates.maxPeriods = true;
      hasError = true;
    } else if (maxPeriods.length > 10) {
      newErrors.maxPeriods = "Maximum length is 10 characters.";
      newErrorStates.maxPeriods = true;
      hasError = true;
    } else {
      newErrorStates.maxPeriods = false;
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);
    if (hasError) return;
    // backend integration part here
  };

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Teacher Details</h4>
          <button onClick={closeBtnClickHandler}>
            <X></X>
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.inputContainer}>
            {" "}
            <label htmlFor="class-name-entry-wa901">
              <p>Teacher Name</p>

              <p
                className={`${styles.errorText}  ${
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
              id="class-name-entry-wa901"
            />
          </div>

          <div className={styles.inputContainer}>
            {" "}
            <label htmlFor="class-no-entry-wa902">
              <p>Maximum periods per week </p>

              <p
                className={`${styles.errorText}  ${
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
              type="text"
              placeholder="Enter maximum periods"
              id="class-no-entry-wa902"
            />
          </div>
        </div>

        <div className={styles.actionBtns}>
          <button className={styles.btnItem} onClick={closeBtnClickHandler}>
            Cancel
          </button>
          <button
            className={`${styles.btnItem} ${styles.saveBtn}`}
            onClick={addBtnClickHandler}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPopup;
