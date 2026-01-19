import styles from "./Subjects.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import SubjectItem from "./Components/SubjectItem";

import { useNavigate } from "react-router-dom";
import Filter from "../Components/filter/Filter";
import axios from "axios";
import { useAuth } from "../../../Context/AuthProvider";
import ErrorLoadingStates from "../Components/ErrorLoadingStates/ErrorLoadingStates";
const Subjects = () => {
  const navigate = useNavigate();
  const { refreshToken } = useAuth();
  //state variables needed
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
          console.log("hoho");
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
          Math.max(MIN_TIME - elapsed, 0),
        ); // to avoid negative numbers here..
      }
    };

    fetchAllSubjects();
  }, []);

  useEffect(() => {
    console.log(subjects);
  }, [subjects]);
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
          : item,
      ),
    );
  };

  return (
    <div className={styles.subjects}>
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
              onClick={() => navigate("/subjects/new")}
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
                  subjectName={value.subject}
                  daily={{ min: value.min_per_day, max: value.max_per_day }}
                  weekly={{ min: value.min_per_week, max: value.max_per_week }}
                  consecutive={{
                    min: value.min_consecutive_class,
                    max: value.max_consecutive_class,
                  }}
                  deleteSubject={deleteSubjectItem}
                  editSubject={editSubjectItem}
                  toughnessLevel={value.is_hard_sub}
                />
              );
            })
          )}

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
