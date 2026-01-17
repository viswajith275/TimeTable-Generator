import styles from "./Subjects.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import SubjectDetailsPopup from "./Components/SubjectDetailsPopup";
import SubjectItem from "./Components/SubjectItem";
import Filter from "../Components/filter/Filter";
import axios from "axios";
import { useAuth } from "../../../Context/AuthProvider";

import ErrorLoadingStates from "../Components/ErrorLoadingStates/ErrorLoadingStates";
const Subjects = () => {
  const { refreshToken } = useAuth();
  //state variables needed
  const [popupShow, setPopupShow] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(true);

  //fetches all the subjects on mounting of component
  useEffect(() => {
    const fetchAllSubjects = async (hasRetried = false) => {
      // Ensure the loader is visible for at least MIN_TIME.
      // If the API responds faster, we wait the remaining time.
      // If it takes longer, we stop loading immediately (no extra delay). Math.max is used to prevent that (in case of -ve delay, make it 0)
      // this prevents that flickering problem.. so kind of a smooth transition
      const start = Date.now();
      try {
        const { data } = await axios.get("/api/subjects"); // instead of response.data  destructure that object

        setSubjects(data);
      } catch (err) {
        console.log(err);
        if (err?.response?.status == 401 && !hasRetried) {
          await refreshToken();
          await fetchAllSubjects(true); //hasRetried act as a retry guard preventing multiple recursion calls
        }
      } finally {
        const MIN_TIME = 500; //in ms
        const elapsed = Date.now() - start;
        setTimeout(
          () => {
            setIsSubjectsLoading(false);
          },
          Math.max(MIN_TIME - elapsed, 0)
        ); // to avoid negative numbers here..
      }
    };

    fetchAllSubjects();
  }, []);

  const deleteSubjectItem = (id) => {
    setSubjects((prev) => prev.filter((item) => item.id !== id));
  };
  const addSubjectItem = (data) => {
    setSubjects([...subjects, data]);
  };
  const editSubjectItem = (data) => {
    setSubjects((prev) =>
      prev.map((item) =>
        item.id === data.id
          ? {
              ...item,
              c_name: data.c_name,
              r_name: data.r_name,
            }
          : item
      )
    );
  };

  return (
    <div className={styles.subjects}>
      <div
        style={{
          pointerEvents: popupShow ? "auto" : "none",
          opacity: popupShow ? 0.7 : 0,
        }}
        className="popup_overlay"
        onClick={() => setPopupShow(false)}
      ></div>

      <SubjectDetailsPopup
        addSubject={addSubjectItem}
        isPopupOpen={popupShow}
        popUpClose={() => setPopupShow(false)}
      />
      <Navbar></Navbar>
      <div className={styles.mainPanelPlaceholder}>
        <Topbar></Topbar>
        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <div>
              <h2>Subjects</h2>
              <p>Add and edit subjects for the timetable.</p>
            </div>

            <button
              className={styles.createBtn}
              onClick={() => {
                setPopupShow(true);
              }}
            >
              <Plus />
              <p>Add Subject</p>
            </button>
          </div>
        </div>

        <div className={styles.utilityPanel}>
          <Filter></Filter>
        </div>

        <div className={styles.gridSubjects}>
          {isSubjectsLoading ? (
            <ErrorLoadingStates state={"loading"} />
          ) : (
            Object.values(subjects).map((value) => {
              return (
                <SubjectItem
                  key={value.id}
                  id={value.id}
                  roomName={value.c_name}
                  roomNumber={value.r_name}
                  deleteSubject={deleteSubjectItem}
                  editSubject={editSubjectItem}
                />
              );
            })
          )}
          {/* //Work in progress */}
          {Object.values(subjects).length == 0 && !isSubjectsLoading ? (
            <ErrorLoadingStates
              state={"empty"}
              listName={"subject"}
              btnName={"Add Subject"}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
