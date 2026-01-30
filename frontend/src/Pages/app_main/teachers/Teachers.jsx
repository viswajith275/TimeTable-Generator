import styles from "./teacher.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import axios from "axios";
import { Plus } from "lucide-react";
import TeacherItem from "./Components/TeacherItem";
import { useState, useEffect } from "react";
import TeacherPopup from "./Components/TeacherPopup";
import Filter from "../Components/filter/Filter";
import { useAuth } from "../../../Context/AuthProvider";
import ErrorLoadingStates from "../Components/ErrorLoadingStates/ErrorLoadingStates";

const Teachers = () => {
  const { refreshToken } = useAuth();

  const [popupShow, setPopupShow] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [isTeachersLoading, setIsTeachersLoading] = useState(true);

  //fetches all the classes on mounting of component
  useEffect(() => {
    const fetchAllTeachers = async (hasRetried = false) => {
      // Ensure the loader is visible for at least MIN_TIME.
      // If the API responds faster, we wait the remaining time.
      // If it takes longer, we stop loading immediately (no extra delay). Math.max is used to prevent that (in case of -ve delay, make it 0)
      // this prevents that flickering problem.. so kind of a smooth transition
      const start = Date.now();
      try {
        const { data } = await axios.get("/api/teachers"); // instead of response.data  destructure that object
        console.log(data);
        setTeachers(data);
      } catch (err) {
        console.log(err);
        if (err?.response?.status == 401 && !hasRetried) {
          await refreshToken();
          await fetchAllTeachers(true); //hasRetried act as a retry guard preventing multiple recursion calls
        }
      } finally {
        const MIN_TIME = 500; //in ms
        const elapsed = Date.now() - start;
        setTimeout(
          () => {
            setIsTeachersLoading(false);
          },
          Math.max(MIN_TIME - elapsed, 0),
        ); // to avoid negative numbers here..
      }
    };

    fetchAllTeachers();
  }, []);

  const addTeacherItem = (data) => {
    setTeachers([...teachers, data]);
  };
  const deleteTeacherItem = (id) => {
    setTeachers((prev) => prev.filter((item) => item.id !== id));
  };

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
      <TeacherPopup
        isPopupOpen={popupShow}
        popUpClose={() => setPopupShow(false)}
        addTeacher={addTeacherItem}
      ></TeacherPopup>
      <Navbar></Navbar>
      <div className={styles.mainPanelPlaceholder}>
        <Topbar></Topbar>
        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <div>
              <h2>Teachers</h2>
              <p>
                Edit and update the details of teachers in your organization.
              </p>
            </div>

            <button
              className={styles.createBtn}
              onClick={() => {
                setPopupShow(true);
              }}
            >
              <Plus />
              <p>Add Teacher</p>
            </button>
          </div>
        </div>

        <div className={styles.utilityPanel}>
          <Filter></Filter>
        </div>

        <div className={styles.gridTeachers}>
          {isTeachersLoading ? (
            <ErrorLoadingStates state={"loading"} />
          ) : (
            Object.values(teachers).map((value) => {
              return (
                <TeacherItem
                  key={value.id}
                  id={value.id}
                  assigments={value.class_assignments}
                  teacherName={value.t_name}
                  deleteTeacher={deleteTeacherItem}
                />
              );
            })
          )}

          {Object.values(teachers).length == 0 && !isTeachersLoading ? (
            <ErrorLoadingStates
              state={"empty"}
              listName={"teachers"}
              btnName={"Add teacher"}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Teachers;
