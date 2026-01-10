import styles from "./Classes.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import { useState } from "react";
import ClassDetailsPopup from "./Components/ClassDetailsPopup";
import ClassItem from "./Components/ClassItem";
const Classes = () => {
  const [popupShow, setPopupShow] = useState(false);
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

        <div className={styles.gridClasses}>
          <ClassItem roomName={"S1 CSE"} roomNumber={"Room 101A"}></ClassItem>
        </div>
      </div>
    </div>
  );
};

export default Classes;
