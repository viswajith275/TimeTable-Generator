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
import axios from "axios";
import { useAuth } from "../../../Context/AuthProvider";
import { toast } from "react-toastify";

const Subjects = () => {
  const navigate = useNavigate();

  const { subjects, setSubjects, subjectsLoaded, fetchSubjects, error } =
    useSubjects();

  const { refreshToken } = useAuth();

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

  const deleteSubject = async (id) => {
    const deleteReq = async (hasRetried = false) => {
      try {
        await axios.delete(`/api/subjects/${id}`);
        return true;
      } catch (err) {
        if (err?.response?.status === 401 && !hasRetried) {
          await refreshToken();
          return await deleteReq(true);
        }
        toast.error("Failed to delete subject");
        return false;
      }
    };

    const ok = await deleteReq(false);

    if (ok) {
      setSubjects((prev) => prev.filter((item) => item.id !== id));
    }
  };

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
        {isSubjectsLoading && (
          <div className="small-container">
            <ErrorLoadingStates state="loading" />
          </div>
        )}
        <div className={styles.gridSubjects}>
          {!isSubjectsLoading &&
            Object.values(subjects).map((value) => (
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
                onRequestDelete={deleteSubject}
                editSubject={editSubjectItem}
              />
            ))}
        </div>
        {Object.values(subjects).length === 0 && !isSubjectsLoading && (
          <div className="small-container">
            <ErrorLoadingStates
              state="empty"
              listName="subject"
              btnName="Add Subject"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
