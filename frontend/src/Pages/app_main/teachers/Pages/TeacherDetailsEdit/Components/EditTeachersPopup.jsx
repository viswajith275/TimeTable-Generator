import styles from "./EditTeachersPopup.module.css";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

/**
 * EditTeachersPopup Component
 *
 * A modal popup component for editing teacher details (name or max periods).
 * The component dynamically displays different input fields based on what element
 * is being edited (targetElm). It includes validation, change detection, and handles
 * API calls to update teacher information.
 *
 * Props:
 * - popUpClose: Function to close the popup and reset state
 * - isPopupOpen: Boolean indicating if the popup is currently visible
 * - targetElm: String identifying what is being edited ('name' or 'max_classes')
 * - initialData: Object containing current teacher data (t_name, max_classes,id)
 * - updateMain : function that updates main page
 */

const EditTeachersPopup = ({
  popUpClose,
  isPopupOpen,
  targetElm,
  initialData,
  updateMain,
}) => {
  // State for teacher name and maximum periods input fields
  const [teacherName, setTeacherName] = useState("");
  const [maxPeriods, setMaxPeriods] = useState("");

  // State to store validation error messages for each field
  const [errors, setErrors] = useState({
    teacherName: "",
    maxPeriods: "",
  });

  // State to track which fields have validation errors (for styling)
  const [errorStates, setErrorStates] = useState({
    teacherName: false,
    maxPeriods: false,
  });

  // Initialize form fields with initial data when popup opens or initial data changes
  useEffect(() => {
    if (!initialData) return;

    setTeacherName(initialData.t_name ?? "");
    setMaxPeriods(String(initialData.max_classes ?? ""));
  }, [initialData, isPopupOpen]);

  // Memoized value to detect if any changes have been made to the current field
  // Prevents the Save button from being active if no actual changes occurred
  const isChanged = useMemo(() => {
    if (!initialData) return false;

    // Check if teacher name has changed
    if (targetElm === "name") {
      return teacherName.trim() !== initialData.t_name;
    }

    // Check if max periods has changed
    if (targetElm === "max_classes") {
      return Number(maxPeriods) !== initialData.max_classes;
    }

    return false;
  }, [teacherName, maxPeriods, targetElm, initialData]);

  // Handler to close the popup and reset all error states
  const closeHandler = () => {
    setErrors({ teacherName: "", maxPeriods: "" });
    setErrorStates({ teacherName: false, maxPeriods: false });
    popUpClose();
  };

  // Validation function that checks form inputs based on the target element being edited
  // Returns true if validation passes, false otherwise
  const validate = () => {
    let hasError = false;
    const newErrors = {};
    const newErrorStates = {};

    // Validate teacher name field if editing name
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

    // Validate max periods field if editing max classes
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

    // Update error state in the component
    setErrors(newErrors);
    setErrorStates(newErrorStates);

    return !hasError;
  };

  // Handler to send edit request to the API
  // hasRetried: Flag to prevent infinite retry loops after token refresh
  const editHandler = async (hasRetried = false) => {
    // Validate form before attempting to update
    if (!validate()) return;

    // Skip API call if no changes were made
    if (!isChanged) return;

    // Prepare payload with updated values based on which field is being edited
    const payload = {
      t_name: targetElm === "name" ? teacherName.trim() : initialData.t_name,
      max_classes:
        targetElm === "max_classes"
          ? Number(maxPeriods)
          : initialData.max_classes,
    };

    try {
      // Send PUT request to update teacher details
      const { data } = await axios.put(
        `/api/teachers/${initialData.id}`,
        payload,
      );

      updateMain(data);
      toast.success("Teacher updated successfully");
      popUpClose();
    } catch (err) {
      // Handle 401 Unauthorized error by refreshing token and retrying
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await editHandler(true);
        return;
      }
      // Show error toast for other failures
      toast.error("Failed to update teacher details");
    }
  };

  return (
    // Popup container with conditional open/close styling
    <div
      className={`${styles.popupContainer} ${isPopupOpen ? styles.open : ""}`}
    >
      {/* Main popup content area */}
      <div className={`${styles.popupMain} ${isPopupOpen ? styles.open : ""}`}>
        {/* Header with title and close button */}
        <div className={styles.headingContainer}>
          <h4>Edit Details</h4>
          <button onClick={closeHandler}>
            <X />
          </button>
        </div>

        {/* Form container with conditional input based on targetElm */}
        <div className={styles.formContainer}>
          {/* Teacher name input field - shown when editing name */}
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

          {/* Max periods input field - shown when editing max_classes */}
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

        {/* Action buttons: Cancel and Edit */}
        <div className={styles.actionBtns}>
          <button className={styles.btnItem} onClick={closeHandler}>
            Cancel
          </button>
          {/* Edit button - disabled if no changes were made */}
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
