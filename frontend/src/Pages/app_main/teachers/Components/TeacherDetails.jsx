import styles from "./teacherDetails.module.css";
import { ChevronRight } from "lucide-react";
const TeacherDetails = ({ teacherName, maxPeriods }) => {
  return (
    <div className={styles.teacherItem}>
      <h4>{teacherName}</h4>
      <div className={styles.viewDetails}>
        <p>View Details</p> <ChevronRight></ChevronRight>
      </div>
    </div>
  );
};

export default TeacherDetails;
