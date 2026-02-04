import styles from "./TimeTableView.module.css";
import Navbar from "../../../Components/navbar/Navbar";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import { useState, useEffect, useMemo } from "react";
import Loader from "../../../Components/loader/Loader";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../../Context/AuthProvider";
import axios from "axios";
import ErrorLoadingStates from "../../../Components/ErrorLoadingStates/ErrorLoadingStates";
import SearchableSelect from "../../../Components/SearchableSelect/SearchableSelect";
import TimeTableSubjectItem from "./Components/TimeTableSubjectItem";

const buildSubjectColorMap = (assignments, colors) => {
  const map = {};
  let index = 0;

  assignments.forEach((cls) => {
    cls.assignments.forEach((day) => {
      day.assignments.forEach((a) => {
        if (!map[a.subject]) {
          map[a.subject] = colors[index % colors.length];
          index++;
        }
      });
    });
  });

  return map;
};

const TimeTableView = () => {
  const [timeTable, setTimeTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectColorMap, setSubjectColorMap] = useState({});

  const { refreshToken } = useAuth();
  const { timeTableID } = useParams();

  const [dropDownLabels, setDropDownLabels] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [days, setDays] = useState([]);

  const baseColors = [
    "#4DB7A9", // teal
    "#3D86D8", // blue
    "#52A3DD", // light blue
    "#706FCE", // purple
    "#3E9480", // dark teal

    "#2C7A7B", // deep teal
    "#00BFA6", // minty teal
    "#b188f7", // soft violet
  ];

  const colors = useMemo(() => {
    return [...baseColors].sort(() => Math.random() - 0.5);
  }, [timeTable?.id]);

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

  const editEntry = (data) => {
    setTimeTable((prev) => {
      if (!prev) return prev;

      const updatedAssignments = prev.assignments.map((cls) => {
        if (cls.class_name !== selectedClass.class_name) return cls;

        return {
          ...cls,
          assignments: cls.assignments.map((day) => ({
            ...day,
            assignments: day.assignments.map((a) =>
              a.id === data.id
                ? {
                    ...a,
                    subject: data.subject,
                    teacher_name: data.teacher_name,
                  }
                : a,
            ),
          })),
        };
      });

      const updatedTimeTable = {
        ...prev,
        assignments: updatedAssignments,
      };

      const updatedSelectedClass = updatedAssignments.find(
        (c) => c.class_name === selectedClass.class_name,
      );

      setSelectedClass(updatedSelectedClass);

      return updatedTimeTable;
    });
  };

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
                    "--grid-cols": timeTable?.slots || 0,
                    "--grid-rows": days.length - 1,
                  }}
                >
                  {Array.from(
                    { length: timeTable?.slots + 1 },
                    (_, slotIndex) => (
                      <div
                        key={`slot-header-${slotIndex}`}
                        className={styles.headingRowItem}
                      >
                        <p>{slotIndex === 0 ? "" : `Slot ${slotIndex}`}</p>
                      </div>
                    ),
                  )}

                  {days.slice(1).map((day) =>
                    Array.from(
                      { length: timeTable?.slots + 1 },
                      (_, slotIndex) => {
                        if (slotIndex === 0) {
                          return (
                            <div
                              key={`day-${day}`}
                              className={`${styles.slotBox} ${styles.rowItem}`}
                            >
                              <p>{day}</p>
                            </div>
                          );
                        }

                        const dayData = selectedClass?.assignments.find(
                          (d) => d.day === day,
                        );

                        const subject = dayData?.assignments.find(
                          (a) => a.slot === slotIndex,
                        );

                        return (
                          <div
                            key={`${day}-slot-${slotIndex}`}
                            className={`${styles.subjectBox} ${styles.rowItem}`}
                          >
                            <TimeTableSubjectItem
                              subject={subject}
                              editEntry={editEntry}
                              subjectColorMap={subjectColorMap}
                            />
                          </div>
                        );
                      },
                    ),
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
