import React from "react";
import Loader from "../../Components/loader/Loader";
import styles from "./ErrorLoadingStatesClasses.module.css";
const ErrorLoadingStatesClasses = ({ state }) => {
  return (
    <div className={styles.containerMain}>
      {state === "loading" ? (
        <Loader></Loader>
      ) : (
        <div>
          <p>Error While Loading</p>
        </div>
      )}
    </div>
  );
};

export default ErrorLoadingStatesClasses;
