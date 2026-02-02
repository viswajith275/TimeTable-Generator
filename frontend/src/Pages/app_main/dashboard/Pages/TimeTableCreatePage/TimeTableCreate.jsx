import { useState } from "react";
import styles from "./TimeTableCreate.module.css";
import Navbar from "../../../Components/navbar/Navbar";
import axios from "axios";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import { toast } from "react-toastify";
import { useAuth } from "../../../../../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useGlobalData } from "../../../../../Context/GlobalDataProvider";

const DAYS = [
  { label: "Mon", value: "Monday" },
  { label: "Tue", value: "Tuesday" },
  { label: "Wed", value: "Wednesday" },
  { label: "Thu", value: "Thursday" },
  { label: "Fri", value: "Friday" },
  { label: "Sat", value: "Saturday" },
  { label: "Sun", value: "Sunday" },
];

const TimeTableCreate = () => {
  const { refreshToken } = useAuth();
  const [timetableName, setTimetableName] = useState("");
  const [nameError, setNameError] = useState("");
  const [slots, setSlots] = useState(6);
  const [selectedDays, setSelectedDays] = useState(["Monday"]);
  const [loading, setLoading] = useState(false);
  const { setTimetables } = useGlobalData();
  const navigate = useNavigate();

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmission = async (e, hasRetried = false) => {
    e.preventDefault();

    setNameError("");

    if (!timetableName.trim()) {
      setNameError("Timetable name is required.");
      return;
    }

    if (slots <= 0) {
      toast.error("Number of slots must be at least 1.");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Please select at least one working day.");
      return;
    }

    const payload = {
      timetable_name: timetableName.trim(),
      slots: Number(slots),
      days: selectedDays,
    };

    try {
      setLoading(true);

      const { data } = await axios.post("/api/generate", payload);
      console.log(data, data.timetable_id);
      setTimetables((prev) => [
        ...prev,
        {
          timetable_id: data.timetable_id,
          timetable_name: timetableName.trim(),
        },
      ]);
      navigate(`/dashboard/timetables/${data.timetable_id}`, { replace: true });
    } catch (err) {
      if (err?.response?.status == 401 && !hasRetried) {
        await refreshToken();
        await handleSubmission(e, true);
        return;
      } else if (err?.response?.status == 400) {
        toast.error(
          "The current constraints prevent timetable generation. Please review and edit them.",
        );
        return;
      }
      toast.error("Failed to create timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashBoard}>
      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <TopbarLite className={styles.topbar} />

        <div className={styles.mainPanel}>
          <div className={styles.card}>
            <div className={styles.headings}>
              <h4>Create Timetable</h4>
              <p>Define days and number of slots to get started.</p>
            </div>

            <form onSubmit={handleSubmission} className={styles.form}>
              {/* Timetable Name */}
              <div className={styles.formGroup}>
                <label htmlFor="t-name">
                  <p>Timetable Name</p>{" "}
                  <span
                    className={nameError ? "errorLabel" : ""}
                    style={{ display: nameError ? "inline" : "none" }}
                  >
                    {nameError}
                  </span>
                </label>
                <input
                  id="t-name"
                  type="text"
                  className={nameError ? "errorInput" : ""}
                  placeholder="e.g. Time-Table-2025-6A"
                  value={timetableName}
                  onChange={(e) => {
                    setTimetableName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                />
                <small>Used for identifying this timetable later</small>
              </div>

              {/* Slots */}
              <div className={styles.formGroup}>
                <label>Number of Slots per Day</label>
                <div className={styles.slotInput}>
                  <button
                    type="button"
                    onClick={() => setSlots((s) => Math.max(1, s - 1))}
                  >
                    −
                  </button>
                  <span>{slots}</span>
                  <button type="button" onClick={() => setSlots((s) => s + 1)}>
                    +
                  </button>
                </div>
              </div>

              {/* Days */}
              <div className={styles.formGroup}>
                <label>Select Working Days</label>
                <div className={styles.days}>
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={
                        selectedDays.includes(day.value)
                          ? styles.dayActive
                          : styles.day
                      }
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={styles.submit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Timetable"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTableCreate;
