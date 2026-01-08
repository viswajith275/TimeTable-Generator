import styles from "./Loader.module.css";

const Loader = () => {
    return(
        <div className = {styles.loader}>
            <div className = {styles.box3} />
            <div className = {styles.box2} />
            <div className = {styles.box1} />
        </div>
    );
}

export default Loader;