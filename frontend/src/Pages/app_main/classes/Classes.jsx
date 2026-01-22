import styles from "./Classes.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ClassDetailsPopup from "./Components/ClassDetailsPopup";
import ClassItem from "./Components/ClassItem";
import Filter from "../Components/filter/Filter";
import { useClasses } from "../../../Context/ClassesProvider";

import ErrorLoadingStates from "../Components/ErrorLoadingStates/ErrorLoadingStates";
const Classes = () => {
  const { classes, classesLoaded, setClasses, fetchClasses } = useClasses();
  //state variables needed
  const [popupShow, setPopupShow] = useState(false);

  const [isClassesLoading, setIsClassesLoading] = useState(true);

  //fetches all the classes on mounting of component
  // Ensure the loader is visible for at least MIN_TIME.
  // If the API responds faster, we wait the remaining time.
  // If it takes longer, we stop loading immediately (no extra delay). Math.max is used to prevent that (in case of -ve delay, make it 0)
  // this prevents that flickering problem.. so kind of a smooth transition
  useEffect(() => {
    const load = async () => {
      const MIN_TIME = 500;
      const start = Date.now();

      if (!classesLoaded) {
        await fetchClasses();
      }

      const elapsed = Date.now() - start;
      setTimeout(
        () => setIsClassesLoading(false),
        Math.max(MIN_TIME - elapsed, 0),
      );
    };

    load();
  }, []);

  const deleteClassItem = (id) => {
    setClasses((prev) => prev.filter((item) => item.id !== id));
  };
  const addClassItem = (data) => {
    setClasses([...classes, data]);
  };
  const editClassItem = (data) => {
    setClasses((prev) =>
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
    <div className={styles.classRoom}>
      <div
        style={{
          pointerEvents: popupShow ? "auto" : "none",
          opacity: popupShow ? 0.7 : 0,
        }}
        className="popup_overlay"
        onClick={() => setPopupShow(false)}
      ></div>

      <ClassDetailsPopup
        addClass={addClassItem}
        isPopupOpen={popupShow}
        popUpClose={() => setPopupShow(false)}
      />
      <Navbar></Navbar>
      <div className={styles.mainPanelPlaceholder}>
        <Topbar></Topbar>
        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <div>
              <h2>Classrooms</h2>
              <p>Add and edit classroom details for the timetable.</p>
            </div>

            <button
              className={styles.createBtn}
              onClick={() => {
                setPopupShow(true);
              }}
            >
              <Plus />
              <p>Add Class</p>
            </button>
          </div>
        </div>

        <div className={styles.utilityPanel}>
          <Filter></Filter>
        </div>

        <div className={styles.gridClasses}>
          {/* have used roomName instead of className to avoid confusion
            as classNaame is a pre-defined keyword in jsx */}

          {isClassesLoading ? (
            <ErrorLoadingStates state={"loading"} />
          ) : (
            Object.values(classes).map((value) => {
              return (
                <ClassItem
                  key={value.id}
                  id={value.id}
                  roomName={value.c_name}
                  roomNumber={value.r_name}
                  deleteClass={deleteClassItem}
                  editClass={editClassItem}
                />
              );
            })
          )}
          {/* //Work in progress */}
          {Object.values(classes).length == 0 && !isClassesLoading ? (
            <ErrorLoadingStates
              state={"empty"}
              listName={"classroom"}
              btnName={"Add class"}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Classes;
