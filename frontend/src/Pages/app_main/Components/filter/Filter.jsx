import styles from './Filter.module.css';
import FilterDropdown from '../dropdown/filterDropdown/FilterDropdown';
import { Filter as FilterIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Filter = () => {

    const [open, setOpen] = useState(false);
    
    let menuRef = useRef();

    useEffect(() => {
        const handler = (e) => {
          if (menuRef.current && !menuRef.current.contains(e.target)) {
            setOpen(false);
          }
        };
    
        document.addEventListener("click", handler);
    
        return () => {
          document.removeEventListener("click", handler);
        };
      }, []);

    return (
        <div className={styles.filter} ref={menuRef} onClick={() => { setOpen(prev => !prev); }}>
            Filter
            <FilterIcon size={16}/>

            <FilterDropdown isOpen={open} />
        </div>
    );
};

export default Filter;