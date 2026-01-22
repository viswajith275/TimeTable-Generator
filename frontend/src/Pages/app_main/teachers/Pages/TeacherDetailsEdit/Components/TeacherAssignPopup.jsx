import styles from "./TeacherAssignPopup.module.css";
import { X } from "lucide-react";
import { useState } from "react";
import SearchableSelect from "../../../../Components/SearchableSelect/SearchableSelect";
import axios from "axios";
import { useAuth } from "../../../../../../Context/AuthProvider";
import { toast } from "react-toastify";

const TeacherAssignPopup = ({ popUpClose, isPopupOpen, teacherID }) => {
  const { refreshToken } = useAuth();

  const [teacherRole, setTeacherRole] = useState("");
  const [classRoomID, setClassRoomID] = useState(null);
  const [subjectID, setSubjectID] = useState(null);

  const [errors, setErrors] = useState({
    teacherRole: "",
  });

  const [errorStates, setErrorStates] = useState({
    teacherRole: false,
  });

  const closeBtnClickHandler = () => {
    setTeacherRole("");
    setErrors({ teacherRole: "" });
    setErrorStates({ teacherRole: false });
    popUpClose();
  };

  const validateForm = () => {
    let isValid = true;

    if (!teacherRole.trim()) {
      setErrors({ teacherRole: "Teacher role cannot be empty" });
      setErrorStates({ teacherRole: true });
      isValid = false;
    } else if (teacherRole.length > 30) {
      setErrors({ teacherRole: "Teacher role cannot exceed 30 characters" });
      setErrorStates({ teacherRole: true });
      isValid = false;
    } else {
      setErrors({ teacherRole: "" });
      setErrorStates({ teacherRole: false });
    }

    return isValid;
  };

  const submitHandler = async (e, hasRetried = false) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!classRoomID || !subjectID) {
      toast.error("Please select class and subject");
      return;
    }

    const payload = {
      teacher_id: teacherID,
      class_id: classRoomID,
      subject_id: subjectID,
      role: teacherRole.trim(),
    };

    try {
      const { data } = await axios.post("/api/assignments", payload);
      console.log(data);
      toast.success("Assignment added successfully");
      closeBtnClickHandler();
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 && !hasRetried) {
        try {
          await refreshToken();
          return submitHandler(e, true);
        } catch {
          toast.error("Session expired. Please log in again.");
          return;
        }
      }

      toast.error(
        error?.response?.data?.message ||
          "Failed to add assignment. Please try again.",
      );
    }
  };

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Assignment</h4>
          <button type="button" onClick={closeBtnClickHandler}>
            <X />
          </button>
        </div>

        <form onSubmit={(e) => submitHandler(e)}>
          <div className={styles.classSelect}>
            <p className={styles.label}>Class</p>
            <SearchableSelect
              initialPlaceholder={"Select a class"}
              options={[
                { label: "7A", value: 5 },
                { label: "8A", value: 4 },
              ]}
              setValue={setClassRoomID}
            />
          </div>

          <div className={styles.subjectSelect}>
            <p className={styles.label}>Select Subject</p>
            <SearchableSelect
              initialPlaceholder={"Select a subject"}
              options={[
                { label: "Mathematics", value: 10 },
                { label: "Atp", value: 11 },
                { label: "Hot ishan videos", value: 12 },
                { label: "Hindi", value: 13 },
                { label: "Japanese", value: 14 },
              ]}
              setValue={setSubjectID}
            />
          </div>

          <div className={styles.inputContainer}>
            <label>
              <p>Teacher Role</p>
              <p
                className={`${styles.errorText} ${
                  errorStates.teacherRole ? "" : "hidden"
                }`}
              >
                {errors.teacherRole}
              </p>
            </label>

            <input
              type="text"
              value={teacherRole}
              onChange={(e) => {
                setTeacherRole(e.target.value);
                if (errorStates.teacherRole) {
                  setErrors({ teacherRole: "" });
                  setErrorStates({ teacherRole: false });
                }
              }}
              className={errorStates.teacherRole ? styles.errorField : ""}
              placeholder="Enter role name"
            />
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

export default TeacherAssignPopup;
