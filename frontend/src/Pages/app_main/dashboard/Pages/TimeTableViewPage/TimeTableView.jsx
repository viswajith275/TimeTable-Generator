import styles from "./TimeTableView.module.css";
import Navbar from "../../../Components/navbar/Navbar";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import { useState, useEffect } from "react";
import Loader from "../../../Components/loader/Loader";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../../Context/AuthProvider";
import axios from "axios";
import ErrorLoadingStates from "../../../Components/ErrorLoadingStates/ErrorLoadingStates";
import SearchableSelect from "../../../Components/SearchableSelect/SearchableSelect";

const buildSubjectColorMap = (assignments, colors) => {
  //this color assign function was entirely written with chatgpt so idk what is going on here.. dont bother dming me @asif ali lol
  const subjects = new Set();

  assignments.forEach((cls) => {
    cls.assignments.forEach((day) => {
      day.assignments.forEach((a) => {
        subjects.add(a.subject);
      });
    });
  });

  const subjectList = Array.from(subjects);
  const shuffled = [...colors].sort(() => Math.random() - 0.5);

  const map = {};
  subjectList.forEach((s, i) => {
    map[s] = shuffled[i % shuffled.length];
  });

  return map;
};

const TimeTableView = () => {
  const colors = ["#4DB7A9", "#3D86D8", "#52A3DD", "#706FCE", "#3E9480"];

  const [timeTable, setTimeTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectColorMap, setSubjectColorMap] = useState({});

  const { refreshToken } = useAuth();
  const { timeTableID } = useParams();

  const [dropDownLabels, setDropDownLabels] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [days, setDays] = useState([]);

  useEffect(() => {
    const loadPageData = async (hasRetried = false) => {
      const start = Date.now();

      try {
        const { data } = await axios.get(`/api/timetables/${timeTableID}`);
        setTimeTable(data);
      } catch (err) {
        if (err?.response?.status === 401 && !hasRetried) {
          await refreshToken();
          return loadPageData(true);
        }
        if (err?.response?.status === 404) {
          setError(404);
        }
      } finally {
        const elapsed = Date.now() - start;
        setTimeout(() => setIsLoading(false), Math.max(500 - elapsed, 0));
      }
    };

    loadPageData();
  }, [timeTableID, refreshToken]);

  useEffect(() => {
    if (!timeTable?.assignments?.length) return;

    const options = timeTable.assignments.map((cls) => ({
      label: cls.class_name,
      value: cls.class_name,
    }));

    const firstClass = timeTable.assignments[0];

    setDropDownLabels(options);
    setSelectedClass(firstClass);
    setDays(["", ...firstClass.assignments.map((d) => d.day)]);
    setSubjectColorMap(buildSubjectColorMap(timeTable.assignments, colors));
  }, [timeTable]);

  if (isLoading) {
    return (
      <div className="loader_container">
        <Loader />
      </div>
    );
  }

  if (error === 404) {
    return (
      <div className={styles.timeTableView}>
        <Navbar />
        <div className={styles.mainPanelPlaceholder}>
          <div className={styles.mainPanel}>
            <ErrorLoadingStates state="error" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timeTableView}>
      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <div className={styles.mainPanel}>
          <TopbarLite />

          <div className={styles.timeTableContainer}>
            <div className={styles.mainPanel__headings}>
              <h2>{timeTable?.name}</h2>
            </div>

            <div className={styles.selectClass}>
              <p>Select class :</p>
              <div className={styles.selectDrop}>
                <SearchableSelect
                  options={dropDownLabels}
                  initialPlaceholder={
                    dropDownLabels?.[0]?.label || "Select class"
                  }
                  setValue={(className) => {
                    const cls = timeTable.assignments.find(
                      (c) => c.class_name === className,
                    );
                    setSelectedClass(cls);
                  }}
                />
              </div>
            </div>

            <div className={styles.timeTable}>
              <h4>{selectedClass?.class_name || "Unknown Class"}</h4>

              <div className={styles.timeTableScroll}>
                <div
                  className={styles.timeTableGrid}
                  style={{
                    "--grid-cols": days.length,
                    "--grid-rows": timeTable?.slots || 0,
                  }}
                >
                  {/*first row*/}
                  {days.map((elm, i) => (
                    <div key={i} className={styles.headingRowItem}>
                      <p>{elm}</p>
                    </div>
                  ))}
                  {/* Each rows are formed by iteration.
Array.from({length:n}) is similiar to range(n) in python.
First we check if index = 0 which means.. column before day.. so assign it a slot.
else assign it a subject..
 */}
                  {Array.from({ length: timeTable?.slots }, (_, slotIndex) =>
                    days.map((day, index) => {
                      if (index === 0) {
                        return (
                          <div
                            key={`slot-${slotIndex + 1}`}
                            className={`${styles.slotBox} ${styles.rowItem}`}
                          >
                            <p>Slot {slotIndex + 1}</p>
                          </div>
                        );
                      }

                      const dayData = selectedClass?.assignments.find(
                        (d) => d.day === day,
                      );

                      const subject = dayData?.assignments.find(
                        (a) => a.slot === slotIndex + 1,
                      );

                      return (
                        <div
                          key={`slot-${slotIndex + 1}-${day}`}
                          className={`${styles.subjectBox} ${styles.rowItem}`}
                        >
                          <div
                            className={styles.subItem__background}
                            style={{
                              backgroundColor:
                                subjectColorMap[subject?.subject] || "#E5E7EB",
                              color: subject ? "#fff" : "#6B7280",
                            }} //free period fall back mechanism
                          >
                            <p className={styles.subjectName__rowItem}>
                              {subject?.subject || "Free Period"}
                            </p>
                            <p className={styles.teacherName__rowItem}>
                              {subject?.teacher_name || ""}
                            </p>
                          </div>
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTableView;
