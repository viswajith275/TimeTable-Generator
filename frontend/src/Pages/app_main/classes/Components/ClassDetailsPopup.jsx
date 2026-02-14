import styles from "./ClassDetails.module.css";
import { X } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../../Context/AuthProvider";
const ClassDetailsPopup = ({ popUpClose, isPopupOpen, addClass }) => {
  const { refreshToken } = useAuth();
  const [errors, setErrors] = useState({
    classroom: "",
    roomno: "",
  });

  const [errorStates, setErrorStates] = useState({
    classroom: false,
    roomno: false,
  });

  // two way binding
  const [className, setClassName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [isLab, setIsLab] = useState(false);

  const closeBtnClickHandler = () => {
    // reset state on close
    setClassName("");
    setRoomNumber("");
    setErrors({
      classroom: "",
      roomno: "",
    });
    setErrorStates({
      classroom: false,
      roomno: false,
    });
    setIsLab(false);
    popUpClose();
  };

  const addBtnClickHandler = async (hasRetried = false) => {
    let hasError = false;
    const newErrors = { ...errors };
    const newErrorStates = { ...errorStates };

    if (!className.trim()) {
      newErrors.classroom = "Classname is required";
      newErrorStates.classroom = true;
      hasError = true;
    } else if (className.length > 30) {
      newErrors.classroom = "Maximum length is 30 characters.";
      newErrorStates.classroom = true;
      hasError = true;
    } else {
      newErrorStates.classroom = false;
    }

    if (!roomNumber.trim()) {
      newErrors.roomno = "Roomnumber is required";
      newErrorStates.roomno = true;
      hasError = true;
    } else if (roomNumber.length > 30) {
      newErrors.roomno = "Maximum length is 30 characters.";
      newErrorStates.roomno = true;
      hasError = true;
    } else {
      newErrorStates.roomno = false;
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);

    if (hasError) return;

    try {
      const response = await axios.post("/api/classes", {
        c_name: className,
        r_name: roomNumber,
        is_lab: isLab,
      });

      addClass(response.data);
      toast.success(`${className} added successfully !!`);
    } catch (error) {
      console.error(error);

      if (error?.response?.status == 401 && !hasRetried) {
        await refreshToken();
        await addBtnClickHandler(true);
        return;
      }
      toast.error("Failed to add class");
    }
  };

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Classroom</h4>
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
            <label htmlFor="class-name-entry-wa901">
              <p>Class Name</p>
              <p
                className={`${styles.errorText} ${
                  errorStates.classroom ? "" : "hidden"
                }`}
              >
                {errors.classroom}
              </p>
            </label>
            <input
              className={errorStates.classroom ? styles.errorField : ""}
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              type="text"
              placeholder="Enter class name"
              id="class-name-entry-wa901"
            />
          </div>

          <div className={styles.inputContainer}>
            <label htmlFor="class-no-entry-wa902">
              <p>Room number</p>
              <p
                className={`${styles.errorText} ${
                  errorStates.roomno ? "" : "hidden"
                }`}
              >
                {errors.roomno}
              </p>
            </label>
            <input
              className={errorStates.roomno ? styles.errorField : ""}
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              type="text"
              placeholder="Enter Room number"
              id="class-no-entry-wa902"
            />
          </div>

          <div className={styles.checkBoxContainer}>
            <input
              className={styles.checkbox__item}
              type="checkbox"
              name="is_lab"
              id="lab-check"
              checked={isLab}
              onChange={(e) => setIsLab(e.target.checked)}
            />
            <label htmlFor="lab-check">
              {" "}
              <p>Mark as lab</p>{" "}
            </label>
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

export default ClassDetailsPopup;
