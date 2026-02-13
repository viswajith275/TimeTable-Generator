import styles from "./Classes.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ClassDetailsPopup from "./Components/ClassDetailsPopup";
import ClassItem from "./Components/ClassItem";
import Filter from "../Components/filter/Filter";
import { useClasses } from "../../../Context/ClassesProvider";
import ErrorLoadingStates from "../Components/ErrorLoadingStates/ErrorLoadingStates";

const Classes = () => {
  const { classes, classesLoaded, setClasses, fetchClasses } = useClasses();

  const [popupShow, setPopupShow] = useState(false);
  const [isClassesLoading, setIsClassesLoading] = useState(true);

  // Fetch classes on mount
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

  // Split classrooms and labs
  const classList = useMemo(() => Object.values(classes), [classes]);

  const classRoomList = useMemo(
    () => classList.filter((val) => !val.is_lab),
    [classList],
  );

  const labList = useMemo(
    () => classList.filter((val) => val.is_lab),
    [classList],
  );

  const deleteClassItem = (id) => {
    setClasses((prev) => prev.filter((item) => item.id !== id));
  };

  const addClassItem = (data) => {
    setClasses((prev) => [...prev, data]);
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

      <Navbar />

      <div className={styles.mainPanelPlaceholder}>
        <Topbar />

        <div className={styles.mainPanel}>
          <div className={styles.mainPanel__headings}>
            <div>
              <h2>Classrooms</h2>
              <p>Add and edit classroom details for the timetable.</p>
            </div>

            <button
              className={styles.createBtn}
              onClick={() => setPopupShow(true)}
            >
              <Plus />
              <p>Add Class</p>
            </button>
          </div>
        </div>

        <div className={styles.utilityPanel}>
          <Filter />
        </div>

        {/* Loading */}
        {isClassesLoading && (
          <div className="small_container">
            <ErrorLoadingStates state={"loading"} />
          </div>
        )}

        {/* Empty State */}
        {!isClassesLoading && classList.length === 0 && (
          <div className="small_container">
            <ErrorLoadingStates
              state={"empty"}
              listName={"classroom"}
              btnName={"Add class"}
            />
          </div>
        )}

        {/* classrooms normal  */}
        {!isClassesLoading && classRoomList.length > 0 && (
          <>
            <div className={styles.gridClasses}>
              {classRoomList.map((value) => (
                <ClassItem
                  key={value.id}
                  id={value.id}
                  roomName={value.c_name}
                  roomNumber={value.r_name}
                  deleteClass={deleteClassItem}
                  editClass={editClassItem}
                />
              ))}
            </div>
          </>
        )}

        {/*lab rooms*/}
        {!isClassesLoading && labList.length > 0 && (
          <div className={styles.labContainer}>
            <h3 className={styles.sectionHeading}>Labs</h3>
            <div className={styles.gridClasses}>
              {labList.map((value) => (
                <ClassItem
                  key={value.id}
                  id={value.id}
                  roomName={value.c_name}
                  roomNumber={value.r_name}
                  deleteClass={deleteClassItem}
                  editClass={editClassItem}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;
