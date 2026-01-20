import Navbar from "../../../Components/navbar/Navbar";
import { ChevronLeft } from "lucide-react";
import styles from "./SubjectCreatePage.module.css";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../../../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

const SubjectCreatePage = () => {
  const navigate = useNavigate();
  const { refreshToken } = useAuth();

  const [form, setForm] = useState({
    subject: "",
    min_per_day: "1",
    max_per_day: "2",
    min_per_week: "3",
    max_per_week: "6",
    min_consecutive_class: "1",
    max_consecutive_class: "2",
    is_hard_sub: "Med",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};

    const minDay = Number(form.min_per_day);
    const maxDay = Number(form.max_per_day);
    const minWeek = Number(form.min_per_week);
    const maxWeek = Number(form.max_per_week);
    const minCon = Number(form.min_consecutive_class);
    const maxCon = Number(form.max_consecutive_class);

    if (!form.subject.trim()) {
      e.subject = "Required";
    } else if (form.subject.length > 30) {
      e.subject = "Subject name must not exceed 30 characters.";
    }

    if (minDay > maxDay) {
      e.min_per_day =
        "The minimum number of classes per day cannot be greater than the maximum.";
    }

    if (minWeek > maxWeek) {
      e.min_per_week =
        "The minimum number of classes per week cannot be greater than the maximum.";
    } else if (minWeek < minDay) {
      e.min_per_week =
        "The minimum weekly classes cannot be less than the minimum daily classes.";
    } else if (maxWeek > maxDay * 5) {
      e.min_per_week =
        "The maximum weekly classes exceed what is possible based on daily limits.";
    }

    if (minCon > maxCon) {
      e.min_consecutive_class =
        "The minimum consecutive classes cannot be greater than the maximum.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitHandler = async (hasRetried = false) => {
    if (!validate()) return;

    try {
      await axios.post("/api/subjects", {
        ...form,
        min_per_day: Number(form.min_per_day),
        max_per_day: Number(form.max_per_day),
        min_per_week: Number(form.min_per_week),
        max_per_week: Number(form.max_per_week),
        min_consecutive_class: Number(form.min_consecutive_class),
        max_consecutive_class: Number(form.max_consecutive_class),
      });

      toast.success("Subject created");

      setForm({
        subject: "",
        min_per_day: "1",
        max_per_day: "2",
        min_per_week: "3",
        max_per_week: "6",
        min_consecutive_class: "1",
        max_consecutive_class: "2",
        is_hard_sub: "Med",
      });

      setErrors({});
    } catch (err) {
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await submitHandler(true);
        return;
      }
      toast.error("Failed to create subject");
    }
  };

  return (
    <div className={styles.subjects}>
      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <div className={styles.mainPanel}>
          <div className={styles.pageHeader}>
            <h2>Create Subject</h2>
            <p>Define constraints clearly</p>
          </div>

          <div className={styles.formWrapper}>
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                submitHandler(false);
              }}
            >
              <div className={styles.section}>
                <label className={styles.label}>
                  <span>Subject Name</span>
                  <span className={styles.errorText}>{errors.subject}</span>
                </label>
                <input
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className={errors.subject ? styles.errorField : ""}
                  placeholder="Eg: Mathematics"
                />
              </div>

              <div className={styles.section}>
                <div>
                  <h4>Daily Limits</h4>
                  <p>
                    Adjust the minimum and maximum number of daily classes here.
                  </p>
                </div>
                <div className={styles.grid}>
                  <input
                    type="number"
                    min="0"
                    value={form.min_per_day}
                    onChange={(e) =>
                      handleChange("min_per_day", e.target.value)
                    }
                    className={errors.min_per_day ? styles.errorField : ""}
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.max_per_day}
                    onChange={(e) =>
                      handleChange("max_per_day", e.target.value)
                    }
                  />
                </div>
                {errors.min_per_day && (
                  <div className={styles.errorBox}>
                    <TriangleAlert size={14} />
                    <h4>{errors.min_per_day}</h4>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <div>
                  <h4>Weekly Limits</h4>
                  <p>
                    Adjust the minimum and maximum number of weekly classes
                    here.
                  </p>
                </div>
                <div className={styles.grid}>
                  <input
                    type="number"
                    min="0"
                    value={form.min_per_week}
                    onChange={(e) =>
                      handleChange("min_per_week", e.target.value)
                    }
                    className={errors.min_per_week ? styles.errorField : ""}
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.max_per_week}
                    onChange={(e) =>
                      handleChange("max_per_week", e.target.value)
                    }
                  />
                </div>
                {errors.min_per_week && (
                  <div className={styles.errorBox}>
                    <TriangleAlert size={14} />
                    <h4>{errors.min_per_week}</h4>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <div>
                  <h4>Consecutive Classes</h4>
                  <p>
                    Adjust the minimum and maximum number of consecutive classes
                    here.
                  </p>
                </div>

                <div className={styles.grid}>
                  <input
                    type="number"
                    min="0"
                    value={form.min_consecutive_class}
                    onChange={(e) =>
                      handleChange("min_consecutive_class", e.target.value)
                    }
                    className={
                      errors.min_consecutive_class ? styles.errorField : ""
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.max_consecutive_class}
                    onChange={(e) =>
                      handleChange("max_consecutive_class", e.target.value)
                    }
                  />
                </div>
                {errors.min_consecutive_class && (
                  <div className={styles.errorBox}>
                    <TriangleAlert size={14} />
                    <h4>{errors.min_consecutive_class}</h4>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <div>
                  <h4>Subject Difficulty</h4>
                </div>
                <div className={styles.toughnessGroup}>
                  {["Low", "Med", "High"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleChange("is_hard_sub", lvl)}
                      className={`${styles.toughnessBtn} ${
                        form.is_hard_sub === lvl ? styles.selected : ""
                      }`}
                    >
                      {lvl === "Med" ? "Medium" : lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <div
                  className={styles.goBackBtn}
                  onClick={() => navigate("/subjects")}
                >
                  <ChevronLeft strokeWidth={3} size={16} />
                  <p>Go back</p>
                </div>
                <button type="submit" className={styles.saveBtn}>
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectCreatePage;
