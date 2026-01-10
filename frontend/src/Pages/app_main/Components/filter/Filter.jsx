import styles from './Filter.module.css';
import { Filter as FilterIcon } from 'lucide-react';

const Filter = () => {
    return (
        <div className={styles.filter}>
            Filter
            <FilterIcon size={16}/>
        </div>
    );
};

export default Filter;