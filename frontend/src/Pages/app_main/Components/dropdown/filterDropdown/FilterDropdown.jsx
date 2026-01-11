import styles from './FilterDropdown.module.css';
import FilterMenuItem from './FilterMenuItem';

// TODO:
// change location of these datas as this is universal (maybe a seperate forlder for easy access)
// add selection highlight and default selection
import TeacherData from './TeacherData'; 

const FilterDropdown = ({ isOpen = false }) => {

    // i dont know how to make this scalable, so random bs.
    const FilterData = TeacherData;

    return (
        <div
            className={`${styles.dropdownContainer} ${isOpen ? styles.active : styles.inactive
                }`}
            onClick={(e) => e.stopPropagation()}
        >
            {FilterData.map((item, index) => (
                <FilterMenuItem key={index} item={item}/>
            ))}
        </div>
    );
};

export default FilterDropdown;