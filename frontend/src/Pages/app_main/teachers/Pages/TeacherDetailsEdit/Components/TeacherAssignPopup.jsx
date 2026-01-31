import styles from "./TeacherAssignPopup.module.css";
import { X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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

const ROLE_OPTIONS = [
  { label: "Class Teacher", value: "CLASS_TEACHER" },
  { label: "Subject Teacher", value: "SUBJECT_TEACHER" },
];

const TeacherAssignPopup = ({
  popUpClose,
  isPopupOpen,
  teacherID,
  addAssignment,
  editDetails,
  updateAssignments,
}) => {
  const isEditMode = Boolean(editDetails);

  const { classes } = useClasses();
  const { subjects } = useSubjects();
  const { refreshToken } = useAuth();
  // these are done to form labels for the drop down.. useMemo is used to avoid repeated calculcations..
  // the concept of DP
  const classOptions = useMemo(
    () => classes.map((c) => ({ label: c.c_name, value: c.id })),
    [classes],
  );

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ label: s.subject, value: s.id })),
    [subjects],
  );

  const [classRoomID, setClassRoomID] = useState(null);
  const [subjectID, setSubjectID] = useState(null);
  const [teacherRole, setTeacherRole] = useState(null);
  const [morningClassDays, setMorningClassDays] = useState([]);

  const [initialState, setInitialState] = useState(null);

  const [errors, setErrors] = useState({
    classRoomID: "",
    subjectID: "",
    teacherRole: "",
    morningClassDays: "",
  });

  useEffect(() => {
    if (!isEditMode) return;

    const init = {
      teacherRole: editDetails.role,
      morningClassDays: editDetails.morning_class_days ?? [],
    };

    setTeacherRole(init.teacherRole);
    setMorningClassDays(init.morningClassDays);
    setInitialState(init);
  }, [isEditMode, editDetails]);

  const hasChanges = () => {
    if (!isEditMode || !initialState) return true;

    return (
      initialState.teacherRole !== teacherRole ||
      JSON.stringify(initialState.morningClassDays) !==
        JSON.stringify(morningClassDays)
    );
  };

  const toggleDay = (day) => {
    setMorningClassDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const resetErrors = () => {
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

    if (!isEditMode) {
      if (!classRoomID) {
        nextErrors.classRoomID = "Select a class";
        valid = false;
      }

      if (!subjectID) {
        nextErrors.subjectID = "Select a subject";
        valid = false;
      }
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
    if (isEditMode && !hasChanges()) toast.error("No changes were made");

    const payload = isEditMode
      ? {
          role: teacherRole,
          morning_class_days:
            teacherRole === "CLASS_TEACHER" ? morningClassDays : null,
        }
      : {
          teacher_id: teacherID,
          class_id: classRoomID,
          subject_id: subjectID,
          role: teacherRole,
          morning_class_days:
            teacherRole === "CLASS_TEACHER" ? morningClassDays : null,
        };

    try {
      if (isEditMode) {
        const { data } = await axios.put(
          `/api/assignments/${editDetails.id}`,
          payload,
        );
        updateAssignments(data);
        resetErrors();
        popUpClose();
        return;
      }

      const { data } = await axios.post("/api/assignments", payload);

      addAssignment({
        assign_id: data.id,
        c_name: data.c_name,
        r_name: "",
        role: data.role,
        subject: data.subject_name,
      });

      resetErrors();
      popUpClose();
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401 && !hasRetried) {
        await refreshToken();
        return submitHandler(e, true);
      }

      if (status === 403) {
        return toast.error(
          `Class assignment conflict. ${err?.response?.data?.detail}`,
        );
      }

      toast.error(
        isEditMode ? "Failed to edit assignment." : "Failed to assign class.",
      );
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        <div className={styles.headingContainer}>
          <h4>{isEditMode ? "Edit Assignment" : "Add Assignment"}</h4>
          <button
            type="button"
            onClick={() => {
              resetErrors();
              popUpClose();
            }}
          >
            <X />
          </button>
        </div>

        <form onSubmit={submitHandler} className={styles.form}>
          {/* Class & Subject ONLY in Add Mode */}
          {!isEditMode && (
            <>
              <div className={styles.inputContainer}>
                <label>
                  <p>Class</p>
                  {errors.classRoomID && (
                    <p className={styles.errorText}>{errors.classRoomID}</p>
                  )}
                </label>
                <SearchableSelect
                  initialPlaceholder="Select a class"
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
                  initialPlaceholder="Select a subject"
                  options={subjectOptions}
                  setValue={(v) => {
                    setSubjectID(v);
                    setErrors((p) => ({ ...p, subjectID: "" }));
                  }}
                />
              </div>
            </>
          )}

          {/* Role */}
          <div className={styles.inputContainer}>
            <label>
              <p>Teacher Role</p>
              {errors.teacherRole && (
                <p className={styles.errorText}>{errors.teacherRole}</p>
              )}
            </label>
            <SearchableSelect
              initialPlaceholder="Select a role"
              options={ROLE_OPTIONS}
              setValue={(v) => {
                setTeacherRole(v);
                setMorningClassDays([]);
                setErrors((p) => ({ ...p, teacherRole: "" }));
              }}
            />
          </div>

          {/* Morning days */}
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
            <button type="button" className={styles.btn} onClick={popUpClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditMode && !hasChanges()}
              className={`${styles.btn} ${styles.saveBtn}`}
            >
              {isEditMode ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherAssignPopup;
