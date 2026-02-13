import Navbar from "../../../Components/navbar/Navbar";
import styles from "./SubjectCreatePage.module.css";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../../../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import { useSubjects } from "../../../../../Context/SubjectProvider";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import { Search } from "lucide-react";
import { useClasses } from "../../../../../Context/ClassesProvider";
import Loader from "../../../Components/loader/Loader";
import ErrorLoadingStates from "../../../Components/ErrorLoadingStates/ErrorLoadingStates";
const SubjectCreatePage = () => {
  const navigate = useNavigate();
  const { setSubjects } = useSubjects();
  const { classes, fetchClasses, classesLoaded } = useClasses();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // this error is pageload error

  const [selectedLabs, setSelectedLabs] = useState([]);
  const { refreshToken } = useAuth();

  const [form, setForm] = useState({
    subject: "",
    min_per_day: "",
    max_per_day: "",
    min_per_week: "",
    max_per_week: "",
    min_consecutive_class: "",
    max_consecutive_class: "",
    is_hard_sub: "Med",
  });

  const [errors, setErrors] = useState({}); // this is validation error

  useEffect(() => {
    const loadPageData = async (hasRetried = false) => {
      const start = Date.now();

      try {
        if (!classesLoaded) {
          await fetchClasses();
        }
      } catch (err) {
        if (err?.response?.status === 401 && !hasRetried) {
          await refreshToken();
          return loadPageData(true);
        }

        console.error(err);
        setError(true);
      } finally {
        const MIN_TIME = 500;
        const elapsed = Date.now() - start;

        setTimeout(() => setIsLoading(false), Math.max(MIN_TIME - elapsed, 0));
      }
    };

    loadPageData();
  }, [classesLoaded, fetchClasses, refreshToken]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const [isLab, setIsLab] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const classList = useMemo(() => Object.values(classes), [classes]);
  const labList = useMemo(() => {
    return classList
      .filter((val) => val.is_lab)
      .map((val) => ({
        label: val.r_name,
        value: val.id,
      }));
  }, [classList]);

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
      e.min_per_day = "Minimum per day cannot be greater than maximum.";
    }

    if (minWeek > maxWeek) {
      e.min_per_week = "Minimum per week cannot be greater than maximum.";
    }

    if (minCon > maxCon) {
      e.min_consecutive_class =
        "Minimum consecutive classes cannot be greater than maximum.";
    }
    if (isLab && selectedLabs.length === 0) {
      e.labs = "At least one lab room must be selected.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitHandler = async (hasRetried = false) => {
    if (!validate()) return;

    try {
      const payload = {
        ...form,
        min_per_day: Number(form.min_per_day),
        max_per_day: Number(form.max_per_day),
        min_per_week: Number(form.min_per_week),
        max_per_week: Number(form.max_per_week),
        min_consecutive_class: Number(form.min_consecutive_class),
        max_consecutive_class: Number(form.max_consecutive_class),
        is_lab_subject: isLab,
      };
      if (isLab) {
        payload["lab_classes"] = selectedLabs;
      }

      const { data } = await axios.post("/api/subjects", payload);
      setSubjects((prev) => [...prev, data]);

      toast.success("Subject created");
      setSelectedLabs([]);
      setErrors({});
    } catch (err) {
      console.log(err);
      if (err?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        await submitHandler(true);
        return;
      }
      toast.error("Failed to create subject");
    }
  };

  //clears validation error shown and also toggle lab
  const toggleLab = (id) => {
    setSelectedLabs((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((l) => l !== id)
        : [...prev, id];

      if (updated.length > 0) {
        setErrors((prevErr) => {
          const { labs, ...rest } = prevErr;
          return rest;
        });
      }

      return updated;
    });
  };

  //component
  const LabItem = ({ labName, selected, onToggle, id }) => {
    const handleToggle = () => {
      onToggle(id);
    };

    return (
      <div className={styles.labItem} onClick={handleToggle}>
        <input
          type="checkbox"
          id={`lab-${id}`}
          checked={selected}
          onChange={handleToggle}
          onClick={(e) => e.stopPropagation()}
        />
        <label htmlFor={`lab-${id}`}>{labName}</label>
      </div>
    );
  };

  if (error) {
    return (
      <div className={styles.subjects}>
        <Navbar />
        <div className={styles.mainPanelPlaceholder}>
          <div className={styles.mainPanel}>
            <ErrorLoadingStates state="error" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loader_container">
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.subjects}>
      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <div className={styles.mainPanel}>
          <TopbarLite />
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
              <div className={styles.fullWidthSection}>
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

                <div className={styles.checkboxContainer}>
                  <input
                    checked={isLab}
                    onChange={(e) => setIsLab(e.target.checked)}
                    className="checkbox__item"
                    type="checkbox"
                    name="is lab"
                    id="is-lab-check"
                  />
                  <label htmlFor="is-lab-check">
                    Is this a laboratory subject ?
                  </label>
                </div>
              </div>

              <div className={styles.gridLayout}>
                <div className={styles.gridItem}>
                  <div className={styles.section}>
                    <div>
                      <h4>Daily Limits</h4>
                      <p>
                        Adjust the minimum and maximum number of daily classes.
                      </p>
                    </div>
                    <div className={styles.inputGrid}>
                      <input
                        type="number"
                        min="0"
                        placeholder="min / day"
                        value={form.min_per_day}
                        onChange={(e) =>
                          handleChange("min_per_day", e.target.value)
                        }
                        className={errors.min_per_day ? styles.errorField : ""}
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="max / day"
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
                </div>

                <div className={styles.gridItem}>
                  <div className={styles.section}>
                    <div>
                      <h4>Weekly Limits</h4>
                      <p>
                        Adjust the minimum and maximum number of weekly classes.
                      </p>
                    </div>
                    <div className={styles.inputGrid}>
                      <input
                        type="number"
                        min="0"
                        placeholder="min / week"
                        value={form.min_per_week}
                        onChange={(e) =>
                          handleChange("min_per_week", e.target.value)
                        }
                        className={errors.min_per_week ? styles.errorField : ""}
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="max / week"
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
                </div>

                <div className={styles.gridItem}>
                  <div className={styles.section}>
                    <div>
                      <h4>Consecutive Classes</h4>
                      <p>
                        Adjust the minimum and maximum number of consecutive
                        classes.
                      </p>
                    </div>

                    <div className={styles.inputGrid}>
                      <input
                        type="number"
                        min="0"
                        placeholder="min"
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
                        placeholder="max"
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
                </div>

                <div className={styles.gridItem}>
                  <div className={styles.section}>
                    <div>
                      <h4>Subject Difficulty</h4>
                      <p>
                        Select subject difficulty. Subjects with higher
                        difficulty will be scheduled in earlier slots.
                      </p>
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
                </div>

                <div
                  className={`${styles.gridItem__type2} ${styles.fullWidthGridItem}`}
                  style={{ display: isLab ? "flex" : "none" }}
                >
                  <div
                    className={`${styles.section} ${styles.section__special}`}
                  >
                    <div className={styles.gridItem__header}>
                      <h4>Eligible Lab Rooms</h4>
                      <p>
                        Select rooms that can host this lab. The scheduler will
                        choose from these during allocation.
                      </p>
                    </div>
                    <div className={styles.searchContainer}>
                      <div className={styles.inputField}>
                        <Search size={16} strokeWidth={1.75} />

                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          type="text"
                          placeholder="Search"
                        />
                      </div>
                    </div>
                    {errors.labs && (
                      <div
                        className={`${styles.errorBox} ${styles.errorBox__withpadding}`}
                      >
                        <TriangleAlert size={14} />
                        <h4>{errors.labs}</h4>
                      </div>
                    )}
                    <div className={styles.gridItem__Main}>
                      {labList
                        .filter((val) =>
                          val.label
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        )
                        .map((val) => (
                          <LabItem
                            key={val.value}
                            id={val.value}
                            labName={val.label}
                            selected={selectedLabs.includes(val.value)}
                            onToggle={toggleLab}
                          />
                        ))}
                    </div>

                    <div className={styles.selectedClasses}>
                      <p>
                        {" "}
                        <span>Selected:</span> {selectedLabs.length} rooms
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.fullWidthSection}>
                <div className={styles.actions}>
                  <button type="submit" className={styles.saveBtn}>
                    Create Subject
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectCreatePage;
