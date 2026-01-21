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

const TeacherDetailsEditPage = () => {
  const { teacherid } = useParams(); //fetches ID from URL
  const { refreshToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState([]);
  const [error, setError] = useState(null);

  const [editTargetElm, setEditTargetElm] = useState(null);

  const [popupShow, setPopupShow] = useState(false);

  useEffect(() => {
    const fetchCurrentTeacher = async (hasRetried = false) => {
      // Ensure the loader is visible for at least MIN_TIME.
      // If the API responds faster, we wait the remaining time.
      // If it takes longer, we stop loading immediately (no extra delay). Math.max is used to prevent that (in case of -ve delay, make it 0)
      // this prevents that flickering problem.. so kind of a smooth transition
      const start = Date.now();
      try {
        const { data } = await axios.get(`/api/teachers/${teacherid}`);
        console.log(data);
        setTeacherInfo(data);
      } catch (err) {
        console.log(err);
        if (err?.response?.status == 404) {
          setError(404);
        }

        if (err?.response?.status == 401 && !hasRetried) {
          await refreshToken();
          await fetchCurrentTeacher(true); //hasRetried act as a retry guard preventing multiple recursion calls
        }
      } finally {
        const MIN_TIME = 500; //in ms
        const elapsed = Date.now() - start;
        setTimeout(
          () => {
            setIsLoading(false);
          },
          Math.max(MIN_TIME - elapsed, 0),
        ); // to avoid negative numbers here..
      }
    };

    fetchCurrentTeacher();
  }, []);

  if (error == 404) {
    return (
      <div className={styles.teacher}>
        <Navbar></Navbar>
        <div className={styles.mainPanelPlaceholder}>
          <div className={styles.mainPanel}>
            <ErrorLoadingStates state={"error"}></ErrorLoadingStates>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loader_container">
        <Loader></Loader>
      </div>
    );
  }

  return (
    <div className={styles.teacher}>
      <div
        style={{
          pointerEvents: popupShow ? "auto" : "none",
          opacity: popupShow ? 0.7 : 0,
        }}
        className="popup_overlay"
        onClick={() => setPopupShow(false)}
      ></div>
      <EditTeachersPopup
        isPopupOpen={popupShow}
        targetElm={editTargetElm}
        popUpClose={() => setPopupShow(false)}
        initialData={teacherInfo}
        updateMain={setTeacherInfo}
      ></EditTeachersPopup>

      <Navbar></Navbar>
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
                    <Pen size={16} strokeWidth={2} /> Edit
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
                    {" "}
                    <Pen size={16} strokeWidth={2} /> Edit
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.assigments}>
              <div className={styles.assigments__headingPanel}>
                <h4>Class Assigments</h4>
                <button>
                  <Plus /> Assign Class
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsEditPage;
