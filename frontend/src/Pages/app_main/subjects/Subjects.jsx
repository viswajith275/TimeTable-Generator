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

  const {
    subjects,
    setSubjects,
    subjectsLoaded,
    fetchSubjects,
    error,
  } = useSubjects();

  const { refreshToken } = useAuth();

  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);

  // delete confirmation state
  const [openDelConf, setOpenDelConf] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

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
        Math.max(MIN_TIME - elapsed, 0)
      );
    };

    load();
  }, []);

  // request delete (open popup)
  const requestDeleteSubject = (id) => {
    setSubjectToDelete(id);
    setOpenDelConf(true);
  };

  // confirm delete
  const confirmDeleteSubject = async () => {
    const deleteReq = async (hasRetried = false) => {
      try {
        await axios.delete(`/api/subjects/${subjectToDelete}`);
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
      setSubjects((prev) => prev.filter((item) => item.id !== subjectToDelete));
      setSubjectToDelete(null);
      setOpenDelConf(false);
    }
  };

  // cancel delete
  const cancelDelete = () => {
    setSubjectToDelete(null);
    setOpenDelConf(false);
  };

  const editSubjectItem = (data) => {
    setSubjects((prev) =>
      prev.map((item) =>
        item.id === data.id ? { ...item, ...data } : item
      )
    );
  };

  // Popup component
  const Popup = ({ children }) => {
    return (
      <div className={styles.popup}>
        <div className={styles.overlay} onClick={cancelDelete} />
        <div className={styles.card}>{children}</div>
      </div>
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
          ) : (
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
                onRequestDelete={requestDeleteSubject}
                editSubject={editSubjectItem}
              />
            ))
          )}

          {Object.values(subjects).length === 0 &&
            !isSubjectsLoading &&
            !error && (
              <ErrorLoadingStates
                state="empty"
                listName="subject"
                btnName="Add Subject"
              />
            )}
        </div>
      </div>

      {openDelConf && (
        <Popup>
          <h3>Do you want to delete this subject?</h3>

          <div className={styles.actions}>
            <button className={styles.cancel} onClick={cancelDelete}>
              Cancel
            </button>
            <button className={styles.delBtn} onClick={confirmDeleteSubject}>
              Delete
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default Subjects;
