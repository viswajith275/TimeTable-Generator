import styles from "./TeacherAssignPopup.module.css";
import { X } from "lucide-react";
import { useState, useMemo } from "react";
import SearchableSelect from "../../../../Components/SearchableSelect/SearchableSelect";
import axios from "axios";
import { useAuth } from "../../../../../../Context/AuthProvider";
import { useClasses } from "../../../../../../Context/ClassesProvider";
import { useSubjects } from "../../../../../../Context/SubjectProvider";
import { toast } from "react-toastify";

const DAYS = [
  { label: "Mon", value: "Monday" },
  { label: "Tue", value: "Tuesday" },
  { label: "Wed", value: "Wednesday" },
  { label: "Thu", value: "Thursday" },
  { label: "Fri", value: "Friday" },
  { label: "Sat", value: "Saturday" },
  { label: "Sun", value: "Sunday" },
];

const TeacherAssignPopup = ({
  popUpClose,
  isPopupOpen,
  teacherID,
  addAssignment,
}) => {
  const { classes } = useClasses();
  const { subjects } = useSubjects();
  const { refreshToken } = useAuth();

  const classOptions = useMemo(
    () => classes.map((c) => ({ label: c.c_name, value: c.id })),
    [classes],
  );

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ label: s.subject, value: s.id })),
    [subjects],
  );

  const roleOptions = useMemo(
    () => [
      { label: "Class Teacher", value: "CLASS_TEACHER" },
      { label: "Subject Teacher", value: "SUBJECT_TEACHER" },
    ],
    [],
  );

  const [classRoomID, setClassRoomID] = useState(null);
  const [subjectID, setSubjectID] = useState(null);
  const [teacherRole, setTeacherRole] = useState(null);
  const [morningClassDays, setMorningClassDays] = useState([]);

  const [errors, setErrors] = useState({
    classRoomID: "",
    subjectID: "",
    teacherRole: "",
    morningClassDays: "",
  });

  const toggleDay = (day) => {
    setMorningClassDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const resetState = () => {
    setErrors({
      classRoomID: "",
      subjectID: "",
      teacherRole: "",
      morningClassDays: "",
    });
  };

  const validateForm = () => {
    let valid = true;
    const nextErrors = {
      classRoomID: "",
      subjectID: "",
      teacherRole: "",
      morningClassDays: "",
    };

    if (!classRoomID) {
      nextErrors.classRoomID = "Select a class";
      valid = false;
    }

    if (!subjectID) {
      nextErrors.subjectID = "Select a subject";
      valid = false;
    }

    if (!teacherRole) {
      nextErrors.teacherRole = "Select a teacher role";
      valid = false;
    }

    if (teacherRole === "CLASS_TEACHER" && morningClassDays.length === 0) {
      nextErrors.morningClassDays = "Select at least one day";
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  };

  const submitHandler = async (e, hasRetried = false) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      teacher_id: teacherID,
      class_id: classRoomID,
      subject_id: subjectID,
      role: teacherRole,
      morning_class_days:
        teacherRole === "CLASS_TEACHER" ? morningClassDays : null,
    };

    try {
      const { data } = await axios.post("/api/assignments", payload);

      addAssignment({
        assign_id: data.id,
        c_name: data.c_name,
        r_name: "",
        role: data.role,
        subject: data.subject_name,
      });

      resetState();
      popUpClose();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 && !hasRetried) {
        await refreshToken();
        return await submitHandler(e, true);
      } else if (status == 403) {
        return toast.error("Error: Class assignment conflict!");
      }
    }
  };

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>Add Assignment</h4>
          <button
            type="button"
            onClick={() => {
              resetState();
              popUpClose();
            }}
          >
            <X />
          </button>
        </div>

        <form onSubmit={submitHandler} className={styles.form}>
          <div className={styles.inputContainer}>
            <label>
              <p>Class</p>
              {errors.classRoomID && (
                <p className={styles.errorText}>{errors.classRoomID}</p>
              )}
            </label>
            <SearchableSelect
              initialPlaceholder="Select class"
              options={classOptions}
              setValue={(v) => {
                setClassRoomID(v);
                setErrors((p) => ({ ...p, classRoomID: "" }));
              }}
            />
          </div>

          <div className={styles.inputContainer}>
            <label>
              <p>Subject</p>
              {errors.subjectID && (
                <p className={styles.errorText}>{errors.subjectID}</p>
              )}
            </label>
            <SearchableSelect
              initialPlaceholder="Select subject"
              options={subjectOptions}
              setValue={(v) => {
                setSubjectID(v);
                setErrors((p) => ({ ...p, subjectID: "" }));
              }}
            />
          </div>

          <div className={styles.inputContainer}>
            <label>
              <p>Teacher Role</p>
              {errors.teacherRole && (
                <p className={styles.errorText}>{errors.teacherRole}</p>
              )}
            </label>
            <SearchableSelect
              initialPlaceholder="Select role"
              options={roleOptions}
              setValue={(v) => {
                setTeacherRole(v);
                setMorningClassDays([]);
                setErrors((p) => ({ ...p, teacherRole: "" }));
              }}
            />
          </div>

          {teacherRole === "CLASS_TEACHER" && (
            <div className={styles.inputContainer}>
              <label>
                <p>Morning Class Days</p>
                {errors.morningClassDays && (
                  <p className={styles.errorText}>{errors.morningClassDays}</p>
                )}
              </label>

              <div className={styles.days}>
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className={
                      morningClassDays.includes(d.value)
                        ? styles.dayActive
                        : styles.day
                    }
                    onClick={() => {
                      toggleDay(d.value);
                      setErrors((p) => ({ ...p, morningClassDays: "" }));
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.actionBtns}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                resetState();
                popUpClose();
              }}
            >
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.saveBtn}`}>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherAssignPopup;
