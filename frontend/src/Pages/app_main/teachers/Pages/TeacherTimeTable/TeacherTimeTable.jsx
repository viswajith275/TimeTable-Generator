import { useParams } from "react-router-dom";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import Navbar from "../../../Components/navbar/Navbar";
import styles from "./TeacherTimeTable.module.css";
import { useEffect, useMemo, useState } from "react";
import { useTeachers } from "../../../../../Context/TeacherProvider";
import { useGlobalData } from "../../../../../Context/GlobalDataProvider";
import Loader from "../../../Components/loader/Loader";
import ErrorLoadingStates from "../../../Components/ErrorLoadingStates/ErrorLoadingStates";
import SearchableSelect from "../../../Components/SearchableSelect/SearchableSelect";

const TeacherTimeTable = () => {
  const { teacherid } = useParams();
  const { teachers, teachersLoaded, fetchTeachers } = useTeachers();
  const { timetables, timeTableLoaded, fetchTimeTables } = useGlobalData();
  const [selectedTimeTable, setSelectedTimeTable] = useState(null);

  const [teacherData, setTeacherData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); //handle error (Todo)

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

  useEffect(() => {});

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
                <div className={styles.timeTableGrid}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTimeTable;
