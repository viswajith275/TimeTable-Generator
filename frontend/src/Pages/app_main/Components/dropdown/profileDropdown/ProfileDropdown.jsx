import styles from './ProfileDropdown.module.css';
import { UserRound, Settings, HelpCircle, LogOut } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../../../Context/AuthProvider';
const ProfileDropdown = ({ isOpen }) => {

    const {logout}=useAuth();
    const logoutBtnHandler = async () =>{
        const response = await axios.post(
                  "/api/logout","",      {
        headers: {
          "Content-Type": "aapplication/json",
        },
        withCredentials: true,
      }
        );

        console.log(response.data)

        if(response.status==200){
            logout();
        }
    }
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
            <div className={`${styles.listItem} ${styles.logoutBtn}`} onClick={logoutBtnHandler}>
                <LogOut size={16}/>
                Logout
            </div>
        </div>
    );
}

export default ProfileDropdown;