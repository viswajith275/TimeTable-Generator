import styles from "./TeacherDetailsEditPage.module.css";
import Navbar from "../../../Components/navbar/Navbar";
import { Pen, Plus } from "lucide-react";
import Loader from "../../../Components/loader/Loader";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../Context/AuthProvider";
import { useParams } from "react-router-dom";
import axios from "axios";
import ErrorLoadingStates from "../../../Components/ErrorLoadingStates/ErrorLoadingStates";
import EditTeachersPopup from "./Components/EditTeachersPopup";
import AssignmentItem from "./Components/AssignmentItem";
import TeacherAssignPopup from "./Components/TeacherAssignPopup";

const TeacherDetailsEditPage = () => {
  const { teacherid } = useParams();
  const { refreshToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState({});
  const [error, setError] = useState(null);

  // Edit teacher popup
  const [popupShow, setPopupShow] = useState(false);
  const [editTargetElm, setEditTargetElm] = useState(null);

  // Assign class popup
  const [assignPopupShow, setAssignPopupShow] = useState(false);

  useEffect(() => {
    const fetchCurrentTeacher = async (hasRetried = false) => {
      const start = Date.now();

      try {
        const { data } = await axios.get(`/api/teachers/${teacherid}`);
        setTeacherInfo(data);
      } catch (err) {
        if (err?.response?.status === 404) {
          setError(404);
        }

        if (err?.response?.status === 401 && !hasRetried) {
          await refreshToken();
          await fetchCurrentTeacher(true);
        }
      } finally {
        const MIN_TIME = 500;
        const elapsed = Date.now() - start;

        setTimeout(() => setIsLoading(false), Math.max(MIN_TIME - elapsed, 0));
      }
    };

    fetchCurrentTeacher();
  }, [teacherid, refreshToken]);

  if (error === 404) {
    return (
      <div className={styles.teacher}>
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
    <div className={styles.teacher}>
      <div
        className="popup_overlay"
        style={{
          pointerEvents: popupShow || assignPopupShow ? "auto" : "none",
          opacity: popupShow || assignPopupShow ? 0.7 : 0,
        }}
        onClick={() => {
          setPopupShow(false);
          setAssignPopupShow(false);
        }}
      />

      <EditTeachersPopup
        isPopupOpen={popupShow}
        targetElm={editTargetElm}
        popUpClose={() => setPopupShow(false)}
        initialData={teacherInfo}
        updateMain={setTeacherInfo}
      />

      <TeacherAssignPopup
        isPopupOpen={assignPopupShow}
        popUpClose={() => setAssignPopupShow(false)}
        teacherId={teacherid}
      />

      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <h2>Edit Teacher Details</h2>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.teacherInfo}>
              <h4>Teacher Information</h4>

              <div className={styles.grid__teacherInfo}>
                <div className={styles.gridItem__teacherInfo}>
                  <div>
                    <p>Teacher Name</p>
                    <h4>{teacherInfo.t_name}</h4>
                  </div>

                  <button
                    className={styles.editBtn__teacherInfo}
                    onClick={() => {
                      setEditTargetElm("name");
                      setPopupShow(true);
                    }}
                  >
                    <Pen size={16} strokeWidth={2} />
                    Edit
                  </button>
                </div>

                <div className={styles.gridItem__teacherInfo}>
                  <div>
                    <p>Max Classes Per Week</p>
                    <h4>{teacherInfo.max_classes}</h4>
                  </div>

                  <button
                    className={styles.editBtn__teacherInfo}
                    onClick={() => {
                      setEditTargetElm("max_classes");
                      setPopupShow(true);
                    }}
                  >
                    <Pen size={16} strokeWidth={2} />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.assigments}>
              <div className={styles.assigments__headingPanel}>
                <h4>Class Assignments</h4>
                <button onClick={() => setAssignPopupShow(true)}>
                  <Plus />
                  Assign Class
                </button>
              </div>

              <div className={styles.assigments___container}>
                <AssignmentItem />
                <AssignmentItem />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsEditPage;
