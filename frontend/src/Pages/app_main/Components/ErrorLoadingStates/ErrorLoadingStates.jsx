import Loader from "../loader/Loader";
import styles from "./ErrorLoadingStates.module.css";
const ErrorLoadingStates = ({ state, listName, btnName }) => {
  if (state == "loading") {
    return (
      <div className={styles.containerMain}>
        <Loader></Loader>
      </div>
    );
  } else if (state == "empty") {
    return (
      <div className={styles.containerMain}>
        <p>
          Your {listName} list is empty. Click ‘{btnName}’ to get started.
        </p>
      </div>
    );
  } else {
    // need to style this guys.. @asif ali ?!
    // This section for unknown errors btw.. maybe we can add "network error" thingy too with a wifi/connectivity icon idk
    return (
      <div className={styles.containerMain}>
        <h4>An unknown error occured.</h4>
        <button>Retry</button>
      </div>
    );
  }
};

export default ErrorLoadingStates;
