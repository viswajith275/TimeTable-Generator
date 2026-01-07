import styles from "./teacher.module.css";
import Navbar from "../Components/navbar/Navbar";
import Topbar from "../Components/topbar/Topbar";
import { Plus } from "lucide-react";
import TeacherDetails from "./Components/TeacherDetails";
import { useState } from "react";
import TeacherPopup from "./Components/TeacherPopup";

const Teachers = () => {
  const [popupShow, setPopupShow] = useState(false);

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
              <p>Create New</p>
            </button>
          </div>
        </div>

        <div className={styles.gridTeachers}>
          <TeacherDetails teacherName={"Jithin Chandran"}></TeacherDetails>
          <TeacherDetails teacherName={"Jithin Chandran"}></TeacherDetails>
          <TeacherDetails teacherName={"Jithin Chandran"}></TeacherDetails>
          <TeacherDetails teacherName={"Jithin Chandran"}></TeacherDetails>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
