import styles from "./Subjects.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import SubjectItem from "./Components/SubjectItem";
import { useNavigate } from "react-router-dom";
import Filter from "../Components/filter/Filter";
import ErrorLoadingStates from "../Components/ErrorLoadingStates/ErrorLoadingStates";
import { useSubjects } from "../../../Context/SubjectProvider";
const Subjects = () => {
  const navigate = useNavigate();

  const { subjects, setSubjects, subjectsLoaded, fetchSubjects, error } =
    useSubjects();

  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);

  // fetch once + smooth loader
  useEffect(() => {
    const load = async () => {
      const MIN_TIME = 500;
      const start = Date.now();

      if (!subjectsLoaded) {
        await fetchSubjects();
      }

      const elapsed = Date.now() - start;
      setTimeout(
        () => setIsSubjectsLoading(false),
        Math.max(MIN_TIME - elapsed, 0),
      );
    };

    load();
  }, []);

  const deleteSubjectItem = (id) => {
    setSubjects((prev) => prev.filter((item) => item.id !== id));
  };

  // const addSubjectItem = (data) => {
  //   setSubjects((prev) => [...prev, data]);
  // };

  const editSubjectItem = (data) => {
    setSubjects((prev) =>
      prev.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
    );
  };

  return (
    <div className={styles.subjects}>
      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <Topbar />

        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <div>
              <h2>Subjects</h2>
              <p>Add and edit subjects for the timetable.</p>
            </div>

            <button
              className={styles.createBtn}
              onClick={() => navigate("/subjects/new")}
            >
              <Plus />
              <p>Add Subject</p>
            </button>
          </div>
        </div>

        <div className={styles.utilityPanel}>
          <Filter />
        </div>

        <div className={styles.gridSubjects}>
          {isSubjectsLoading ? (
            <ErrorLoadingStates state="loading" />
          ) : error ? (
            <ErrorLoadingStates state="error" />
          ) : (
            subjects.map((value) => (
              <SubjectItem
                key={value.id}
                id={value.id}
                subjectName={value.subject}
                daily={{ min: value.min_per_day, max: value.max_per_day }}
                weekly={{ min: value.min_per_week, max: value.max_per_week }}
                consecutive={{
                  min: value.min_consecutive_class,
                  max: value.max_consecutive_class,
                }}
                toughnessLevel={value.is_hard_sub}
                deleteSubject={deleteSubjectItem}
                editSubject={editSubjectItem}
              />
            ))
          )}

          {subjects.length === 0 && !isSubjectsLoading && !error && (
            <ErrorLoadingStates
              state="empty"
              listName="subject"
              btnName="Add Subject"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
