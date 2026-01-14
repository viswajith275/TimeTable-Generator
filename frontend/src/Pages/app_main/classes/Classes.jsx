import styles from "./Classes.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ClassDetailsPopup from "./Components/ClassDetailsPopup";
import ClassItem from "./Components/ClassItem";
import Filter from "../Components/filter/Filter";
import axios from "axios";

const Classes = () => {
  //state variables needed
  const [popupShow, setPopupShow] = useState(false);
  const [classes, setClasses] = useState({});
  const [isClassesLoading, setIsClassesLoading] = useState(true);

  //fetches all the classes on mounting of component
  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const { data } = await axios.get("/api/classes"); // instead of response.data  destructure that object

        setClasses(data);
      } catch (err) {
        console.log(err);
      } finally {
        setIsClassesLoading(false);
      }
    };

    fetchAllClasses();
  }, []);
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
          {Object.values(classes).map((value) => {
            return (
              <ClassItem
                key={value.id}
                roomName={value.c_name}
                roomNumber={value.r_name}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Classes;
