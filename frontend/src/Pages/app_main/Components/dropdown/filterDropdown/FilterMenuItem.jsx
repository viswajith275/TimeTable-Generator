import { useState } from 'react';
import styles from './FilterDropdown.module.css';
import { ChevronRight } from 'lucide-react';

const FilterMenuItem = ({ item }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div
            className={styles.menuItemWrapper}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <div className={styles.listItem}>
                {item.label}
                {hasChildren && <span className={styles.arrow}><ChevronRight size={16}/></span>}
            </div>

            {hasChildren && open && (
                <div className={styles.submenu}>
                    {item.children.map((child, index) => (
                        <FilterMenuItem key={index} item={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterMenuItem;
