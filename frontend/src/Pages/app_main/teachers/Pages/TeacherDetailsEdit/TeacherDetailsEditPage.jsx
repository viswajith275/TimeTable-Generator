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
import { useSubjects } from "../../../../../Context/SubjectProvider";
import { useClasses } from "../../../../../Context/ClassesProvider";
import TopbarLite from "../../../Components/topbar/TopbarLite";
import { useTeachers } from "../../../../../Context/TeacherProvider";
// const roles = {
//   CLASS_TEACHER: "Class Teacher",
//   SUBJECT_TEACHER: "Subject Teacher",
// };
const TeacherDetailsEditPage = () => {
  const { setTeachers } = useTeachers();
  const { classesLoaded, fetchClasses } = useClasses();
  const { subjectsLoaded, fetchSubjects } = useSubjects();
  const { teacherid } = useParams();
  const { refreshToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState({});
  const [error, setError] = useState(null);
  const [editAssignmentTargetDetails, setEditAssignmentTargetDetails] =
    useState(null);

  // Edit teacher popup
  const [popupShow, setPopupShow] = useState(false);
  const [editTargetElm, setEditTargetElm] = useState(null);

  // Assign class popup
  const [assignPopupShow, setAssignPopupShow] = useState(false);

  useEffect(() => {
    const loadPageData = async (hasRetried = false) => {
      const start = Date.now();

      try {
        // fetch teacher
        const teacherReq = axios.get(`/api/teachers/${teacherid}`);

        // fetch shared data only if not cached
        const classesReq = classesLoaded ? null : fetchClasses();
        const subjectsReq = subjectsLoaded ? null : fetchSubjects();

        const [{ data }] = await Promise.all([
          teacherReq,
          classesReq,
          subjectsReq,
        ]);

        setTeacherInfo(data);
      } catch (err) {
        if (err?.response?.status === 404) {
          setError(404);
          return;
        }

        if (err?.response?.status === 401 && !hasRetried) {
          await refreshToken();
          return loadPageData(true);
        }

        console.error(err);
      } finally {
        const MIN_TIME = 500;
        const elapsed = Date.now() - start;

        setTimeout(() => setIsLoading(false), Math.max(MIN_TIME - elapsed, 0));
      }
    };

    loadPageData();
  }, [
    teacherid,
    refreshToken,
    classesLoaded,
    subjectsLoaded,
    fetchClasses,
    fetchSubjects,
  ]);

  const addClassAssignment = (data) => {
    // console.log(data);
    setTeacherInfo((prev) => ({
      ...prev,
      class_assignments: [...prev.class_assignments, data],
    }));
  };

  const deleteClassAssignment = (assignId) => {
    setTeacherInfo((prev) => ({
      ...prev,
      class_assignments: prev.class_assignments.filter(
        (item) => item.assign_id !== assignId,
      ),
    }));
  };

  const editTeacherInfo = (data) => {
    setTeacherInfo(data);
    setTeachers((prev) => prev.map((val) => (val.id === data.id ? data : val)));
  };

  const editClassAssignment = async (id, hasRetried = false) => {
    try {
      const { data } = await axios.get("/api/assignments");
      const assignment = data.find((c) => c.id == id);

      setAssignPopupShow(true);
      setEditAssignmentTargetDetails(assignment);
    } catch (error) {
      if (error?.response?.status === 401 && !hasRetried) {
        await refreshToken();
        return await editClassAssignment(true);
      }
    }
  };
  const updateAssignments = (data) => {
    // console.log(data, teacherInfo);
    // teacherInfo.class_assignments.map((val) => {
    //   console.log(val.assign_id == data.id ? val : "");
    // });
    setTeacherInfo((prev) => ({
      ...prev,
      class_assignments: prev.class_assignments.map((val) => {
        if (val.assign_id == data.id) {
          return { ...val, role: data.role };
        } else {
          return val;
        }
      }),
    }));
  };

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
        popUpClose={() => {
          setPopupShow(false);
        }}
        initialData={teacherInfo}
        updateMain={editTeacherInfo}
      />

      <TeacherAssignPopup
        isPopupOpen={assignPopupShow}
        popUpClose={() => {
          setEditAssignmentTargetDetails(null);

          setAssignPopupShow(false);
        }}
        teacherID={teacherid}
        addAssignment={addClassAssignment}
        editDetails={editAssignmentTargetDetails}
        updateAssignments={updateAssignments}
      />

      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <div className={styles.mainPanel}>
          <TopbarLite />
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
                    <h4>{teacherInfo.max_per_week}</h4>
                  </div>

                  <button
                    className={styles.editBtn__teacherInfo}
                    onClick={() => {
                      setEditTargetElm("max_per_week");
                      setPopupShow(true);
                    }}
                  >
                    <Pen size={16} strokeWidth={2} />
                    Edit
                  </button>
                </div>

                <div className={styles.gridItem__teacherInfo}>
                  <div>
                    <p>Max Classes Per Day</p>
                    <h4>{teacherInfo.max_per_day ?? "—"}</h4>
                  </div>

                  <button
                    className={styles.editBtn__teacherInfo}
                    onClick={() => {
                      setEditTargetElm("max_per_day");
                      setPopupShow(true);
                    }}
                  >
                    <Pen size={16} strokeWidth={2} />
                    Edit
                  </button>
                </div>

                <div className={styles.gridItem__teacherInfo}>
                  <div>
                    <p>Max Consecutive Classes</p>
                    <h4>{teacherInfo.max_consecutive_class ?? "—"}</h4>
                  </div>

                  <button
                    className={styles.editBtn__teacherInfo}
                    onClick={() => {
                      setEditTargetElm("max_consecutive_class");
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
                {teacherInfo.class_assignments.map((elm, i) => (
                  <AssignmentItem
                    onDelete={deleteClassAssignment}
                    key={i}
                    subject={elm.subject}
                    role={elm.role}
                    id={elm.assign_id}
                    className={elm.c_name}
                    onEdit={editClassAssignment}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsEditPage;
