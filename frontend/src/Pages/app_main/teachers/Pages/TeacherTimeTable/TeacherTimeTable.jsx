import { useParams } from "react-router-dom";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import Navbar from "../../../Components/navbar/Navbar";
import styles from "./TeacherTimeTable.module.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { useTeachers } from "../../../../../Context/TeacherProvider";
import { useGlobalData } from "../../../../../Context/GlobalDataProvider";
import Loader from "../../../Components/loader/Loader";
import ErrorLoadingStates from "../../../Components/ErrorLoadingStates/ErrorLoadingStates";
import SearchableSelect from "../../../Components/SearchableSelect/SearchableSelect";
import axios from "axios";
import { useAuth } from "../../../../../Context/AuthProvider";

const colors = ["#4DB7A9", "#3D86D8", "#52A3DD", "#706FCE", "#3E9480"];

const buildColorMap = (assignments) => {
  const classes = new Set();
  assignments.forEach((dayData) => {
    dayData.assignments.forEach((data) => {
      classes.add(data.class_name);
    });
  });
  const classArr = Array.from(classes);
  const shuffled = [...colors];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    //swapping randomly
  }
  console.log(shuffled);

  const map = {};
  classArr.forEach((c, i) => {
    map[c] = shuffled[i % shuffled.length];
  });
  return map;
};

const TeacherTimeTable = () => {
  const { teacherid } = useParams();
  const { refreshToken } = useAuth();
  const { teachers, teachersLoaded, fetchTeachers } = useTeachers();
  const { timetables, timeTableLoaded, fetchTimeTables } = useGlobalData(); //timetableLoaded here is for dropdown.. names of each timetables from context
  const [classColorMap, setColorMap] = useState([]);
  const [selectedTimeTable, setSelectedTimeTable] = useState(null);
  const [timetableLoading, setTimeTableLoading] = useState(false); // this is loading of teacher timetable
  const [teacherData, setTeacherData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); //handle error (Todo)
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState(null);
  const [TIMETABLEDATA, setTIMETABLEDATA] = useState(null); //this is for the json data of timetable to be displayed
  // basically the main stuff.. thats why in caps..

  const timeTableOptions = useMemo(
    () =>
      timetables.map((t) => ({
        label: t.timetable_name,
        value: t.timetable_id,
      })),
    [timetables],
  );

  //setSelect=edTimeTable(timeTableOptions[0]);

  useEffect(() => {
    const load = async () => {
      const MIN_TIME = 500;
      const start = Date.now();
      if (!timeTableLoaded) {
        fetchTimeTables();
      }
      if (!teachersLoaded) {
        await fetchTeachers();
      }
      const elapsed = Date.now() - start;
      setTimeout(
        () => {
          setIsLoading(false);
        },
        Math.max(MIN_TIME - elapsed, 0),
      );
    };
    load();
  }, []);

  useEffect(() => {
    if (teachers.length > 0) {
      const data = teachers.find((c) => c.id == teacherid);
      setTeacherData(data);
    }
  }, [teachers]);

  useEffect(() => {
    setSelectedTimeTable(timetables[0]);
  }, [timetables]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!teacherData || !selectedTimeTable) return;

    const currentRequestId = ++requestIdRef.current;

    const loadTimeTable = async (hasRetried = false) => {
      setTimeTableLoading(true);
      const start = Date.now();
      const MIN_TIME = 1000;
      try {
        const { data } = await axios.get(
          `/api/timetables/${selectedTimeTable.timetable_id}?teacher_name=${teacherData.t_name}`,
        );
        if (currentRequestId !== requestIdRef.current) return;
        // prevents race condition, like if two calls were made at a quite fast rate..
        // the last made call data will be stored..
        setTIMETABLEDATA(data);
      } catch (error) {
        const status = error?.response?.status;
        if (status == 401 && !hasRetried) {
          await refreshToken();
          return loadTimeTable(true);
        }
        setError(status);
      } finally {
        const elapsed = Date.now() - start;
        setTimeout(
          () => {
            setTimeTableLoading(false);
          },
          Math.max(0, MIN_TIME - elapsed),
        );
      }
    };

    loadTimeTable();
  }, [teacherData, selectedTimeTable]);

  useEffect(() => {
    if (TIMETABLEDATA?.assignments?.assignments?.length > 0) {
      const assignments = TIMETABLEDATA?.assignments?.assignments;
      setDays(assignments.map((a) => a.day));
      setSlots(TIMETABLEDATA?.slots);
      setColorMap(buildColorMap(assignments));
    }
  }, [TIMETABLEDATA]);

  // useEffect(() => console.log(selectedTimeTable), [selectedTimeTable]);

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
              <h2>Timetables for {teacherData?.t_name}</h2>
            </div>

            <div className={styles.selectClass}>
              <p>Select timetable :</p>
              <div className={styles.selectDrop}>
                <SearchableSelect
                  options={timeTableOptions}
                  initialPlaceholder={
                    timeTableOptions?.[0]?.label || "Select timetable"
                  }
                  setValue={(tableId) => {
                    setSelectedTimeTable(
                      timetables.find((c) => c.timetable_id == tableId),
                    );
                  }}
                />
              </div>
            </div>

            {/* Timetable */}
            <div className={styles.timeTable}>
              <h4>{selectedTimeTable?.timetable_name || "Timetable"}</h4>

              <div className={styles.timeTableScroll}>
                <div
                  className={styles.timeTableGrid}
                  style={{
                    "--grid-cols": slots + 1 || 0,
                    "--grid-rows": days.length,
                    display: timetableLoading ? "none" : "grid",
                  }}
                >
                  {/* First row of empty box and rest of slots */}
                  {Array.from({ length: slots + 1 }, (_, slotIndex) => (
                    <div
                      className={styles.headingRowItem}
                      key={`slot-${slotIndex}`}
                    >
                      <p>{slotIndex == 0 ? "" : `Slot ${slotIndex}`}</p>
                    </div>
                  ))}

                  {days.map((day, index) =>
                    Array.from({ length: slots + 1 }, (_, slotIndex) => {
                      if (slotIndex == 0) {
                        return (
                          <div
                            key={`dayname-${day}-${index}`}
                            className={`${styles.dayBox} ${styles.rowItem}`}
                          >
                            {day}
                          </div>
                        );
                      }
                      const assignments =
                        TIMETABLEDATA?.assignments?.assignments;
                      const dayData = assignments.find((d) => d.day == day);

                      const subjectData = dayData?.assignments.find(
                        (s) => s.slot == slotIndex,
                      );

                      // return (
                      //   <div key={`${day} - ${slotIndex}`}>
                      //     {subjectData?.subject || "Free Period"}
                      //   </div>
                      // );

                      return (
                        <div
                          key={`${day} - ${slotIndex}`}
                          className={`${styles.subjectBox} ${styles.rowItem}`}
                        >
                          <div
                            className={styles.subItem__background}
                            style={{
                              backgroundColor:
                                classColorMap[subjectData?.class_name] ||
                                "#E5E7EB",
                              color: subjectData?.class_name
                                ? "#fff"
                                : "#6B7280",
                            }} //free period fall back mechanism
                          >
                            <p className={styles.subjectName__rowItem}>
                              {subjectData?.subject || "Free Period"}
                            </p>
                            <p className={styles.className__rowItem}>
                              {subjectData?.class_name || ""}
                            </p>
                            <p className={styles.roomName__rowItem}>
                              {subjectData?.room_name || ""}
                            </p>
                          </div>
                        </div>
                      );
                    }),
                  )}
                </div>

                <div
                  className={styles.loadingTimetable}
                  style={{ display: timetableLoading ? "flex" : "none" }}
                >
                  <Loader />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTimeTable;
