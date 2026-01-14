import React from "react";
import Loader from "../../Components/loader/Loader";
import styles from "./ErrorLoadingStatesClasses.module.css";
const ErrorLoadingStatesClasses = ({ state }) => {
  if (state == "loading") {
    return (
      <div className={styles.containerMain}>
        <Loader></Loader>
      </div>
    );
  } else if (state == "empty") {
    return (
      <div className={styles.containerMain}>
        <p>Your classroom list is empty. Click ‘Add Class’ to get started.</p>
      </div>
    );
  } else {
    <div className={styles.containerMain}>
      <h4>An unknown error occured.</h4>
      <button>Retry</button>
    </div>;
  }
};

export default ErrorLoadingStatesClasses;
