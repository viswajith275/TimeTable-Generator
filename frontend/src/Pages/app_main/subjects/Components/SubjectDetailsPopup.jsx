import styles from "./SubjectDetails.module.css";
import { X } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../../Context/AuthProvider";

const SubjectDetailsPopup = ({ popUpClose, isPopupOpen, addSubject }) => {
  const { refreshToken } = useAuth();

  const [errors, setErrors] = useState({
    subject: "",
    toughness: "",
  });

  const [errorStates, setErrorStates] = useState({
    subject: false,
    toughness: false,
  });

  // two way binding
  const [subjectName, setSubjectName] = useState("");
  const [toughness, setToughness] = useState("medium"); // default

  const closeBtnClickHandler = () => {
    setSubjectName("");
    setToughness("medium");
    setErrors({
      subject: "",
      toughness: "",
    });
    setErrorStates({
      subject: false,
      toughness: false,
    });
    popUpClose();
  };

  const addBtnClickHandler = async (hasRetried = false) => {
    let hasError = false;
    const newErrors = { ...errors };
    const newErrorStates = { ...errorStates };

    // subject name validation
    if (!subjectName.trim()) {
      newErrors.subject = "Subject name is required";
      newErrorStates.subject = true;
      hasError = true;
    } else if (subjectName.length > 30) {
      newErrors.subject = "Maximum length is 30 characters.";
      newErrorStates.subject = true;
      hasError = true;
    } else {
      newErrorStates.subject = false;
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);

    if (hasError) return;

    try {
      const response = await axios.post("/api/subjects", {
        s_name: subjectName,
        toughness,
      });

      addSubject(response.data);
      toast.success(`${subjectName} added successfully !!`);
      closeBtnClickHandler();
    } catch (error) {
      console.error(error);

      if (error?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await addBtnClickHandler(true);
        return;
      }
      toast.error("Failed to add subject");
    }
  };

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Subject</h4>
          <button type="button" onClick={closeBtnClickHandler}>
            <X />
          </button>
        </div>

        <form
          className={styles.formContainer}
          onSubmit={(e) => {
            e.preventDefault();
            addBtnClickHandler(false);
          }}
        >
          <div className={styles.inputContainer}>
            <label htmlFor="subject-name-entry">
              <p>Subject Name</p>
              <p
                className={`${styles.errorText} ${
                  errorStates.subject ? "" : "hidden"
                }`}
              >
                {errors.subject}
              </p>
            </label>
            <input
              className={errorStates.subject ? styles.errorField : ""}
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              type="text"
              placeholder="Enter subject name"
              id="subject-name-entry"
            />
          </div>

          <div className={styles.inputContainer}>
            <label>
              <p>Subject Toughness</p>
            </label>

            <div className={styles.toughnessGroup}>
              {["easy", "medium", "hard"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setToughness(level)}
                  className={`${styles.toughnessBtn} ${
                    toughness === level ? styles.selected : ""
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actionBtns}>
            <button
              type="button"
              className={styles.btnItem}
              onClick={closeBtnClickHandler}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btnItem} ${styles.saveBtn}`}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectDetailsPopup;
