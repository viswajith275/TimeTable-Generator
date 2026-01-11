import styles from './ProfileDropdown.module.css';
import { UserRound, Settings, HelpCircle, LogOut } from 'lucide-react';

const ProfileDropdown = ({ isOpen }) => {
    return (
        <div className={`${styles.dropdownContainer} ${isOpen ? styles.active : styles.inactive
            }`}>
            <div className={styles.listItem}>
                <UserRound size={16}/>
                My Profile
            </div>
            <div className={styles.listItem}>
                <Settings size={16}/>
                Preferences
            </div>
            <div className={styles.listItem}>
                <HelpCircle size={16}/>
                Help & Support
            </div>
            <div className={`${styles.listItem} ${styles.logoutBtn}`}>
                <LogOut size={16}/>
                Logout
            </div>
        </div>
    );
}

export default ProfileDropdown;