import styles from './FilterDropdown.module.css';
import FilterMenuItem from './FilterMenuItem';
import FilterData from './TeacherData';

const FilterDropdown = ({ isOpen = false }) => {
    return (
        <div
            className={`${styles.dropdownContainer} ${isOpen ? styles.active : styles.inactive
                }`}
            onClick={(e) => e.stopPropagation()}
        >
            {FilterData.map((item, index) => (
                <FilterMenuItem key={index} item={item} />
            ))}
        </div>
    );
};

export default FilterDropdown;