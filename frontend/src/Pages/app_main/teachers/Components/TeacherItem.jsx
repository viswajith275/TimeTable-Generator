import styles from "./TeacherItem.module.css";
import { ChevronRight, SquarePen, Trash2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../../Context/AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useGlobalData } from "../../../../Context/GlobalDataProvider";

const TeacherItem = ({ teacherName, assigments = [], id, deleteTeacher }) => {
  const navigate = useNavigate();
  const { refreshToken } = useAuth();
  const { timetables } = useGlobalData();

  const handleDelete = async (hasRetried = false) => {
    try {
      const { data } = await axios.delete(`/api/teachers/${id}`);
      console.log(data);
      deleteTeacher(id);
    } catch (err) {
      if (err?.response?.status == 401 && !hasRetried) {
        await refreshToken();
        await handleDelete(true);
      } else toast.error("Failed to delete teacher item.");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.headContainer}>
        {" "}
        <div className={styles.actions}>
          <SquarePen
            size={18}
            onClick={() => navigate(`/teachers/teacher/edit/${id}`)}
          />
          <Trash2
            size={18}
            className={styles.deleteBtn}
            onClick={() => handleDelete(false)}
          />
        </div>
        <div className={styles.nameContainer}>
          {" "}
          <h4 className={styles.name}>{teacherName}</h4>
        </div>
      </div>

      {/* <div
        className={styles.subjects}
        style={{ display: subjects.length === 0 ? "none" : "flex" }}
      >
        {subjects.map((sub, index) => (
          <span key={index} className={styles.subjectPill}>
            {sub}
          </span>
        ))}
      </div>

      <div
        className={styles.classes}
        style={{ display: classes.length === 0 ? "none" : "flex" }}
      >
        {classes.map((cls, index) => (
          <span key={index} className={styles.classPill}>
            {cls}
          </span>
        ))}
      </div> */}

      <div
        className={styles.viewDetails}
        onClick={() => {
          // if there are assigments we show them details & teacher-specific timetables
          // other wise force them into
          timetables.length === 0
            ? navigate(`/teachers/teacher/edit/${id}`)
            : navigate(`/teachers/teacher/timetable/${id}`);
        }}
      >
        <p>{timetables.length === 0 ? "Assign Classes" : "View Timetable"}</p>
        <ChevronRight size={18} />
      </div>
    </div>
  );
};

export default TeacherItem;
