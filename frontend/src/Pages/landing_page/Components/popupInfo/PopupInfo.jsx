import styles from './PopupInfo.module.css';

const PopupInfo = ( {children, isOpen} ) => {
    return(
        <div className={`${styles.container} ${isOpen ? styles.show : ""}`}>
            {children}
        </div>
    );
};

export default PopupInfo;