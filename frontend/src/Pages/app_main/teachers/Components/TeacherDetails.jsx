import styles from "./teacherDetails.module.css";
import { ChevronRight, SquarePen, Trash2 } from "lucide-react";

/*
  TODO:
    i gave some default values which must be removed.
*/

const TeacherDetails = ({
  teacherName,
  // maxPeriods
  subject,
  classes = ["1A", "2C", "3B", "4A", "5G", "10G"],
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.actions}>
        <SquarePen size={18} />
        <Trash2 size={18} className={styles.deleteBtn}/>
      </div>

      <h4 className={styles.name}>{teacherName}</h4>

      <span className={styles.subject}>{subject}</span>

      <div className={styles.classes}>
        {classes.map((cls, index) => (
          <span key={index} className={styles.classPill}>
            {cls}
          </span>
        ))}
      </div>

      <div className={styles.viewDetails}>
        <p>See Details</p>
        <ChevronRight size={18} />
      </div>
    </div>
  );
};

export default TeacherDetails;
