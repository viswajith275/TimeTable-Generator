import styles from './Error404.module.css';
import Error404Illustration from '../../assets/Error404_Illustration.png';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

//TODO:
// Contact and Report section

const Error404 = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <a onClick={() => navigate('/dashboard') }>Home</a>
                <a>Contact</a>
                <a>Report</a>
            </nav>

            <div className={styles.left}>
                <img src={Error404Illustration} alt="Page not found illustration" />

                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={styles.s1}>
                    <path d="M34.3,-41.2C48.8,-36.7,67.8,-32.5,71.8,-22.7C75.8,-12.9,64.9,2.3,58.7,18.3C52.4,34.3,50.9,51.1,41.9,64.6C32.9,78.1,16.4,88.4,2.2,85.4C-12,82.4,-24.1,66.1,-37.7,54C-51.2,42,-66.3,34.2,-69.3,23C-72.4,11.8,-63.3,-2.9,-57.4,-17.9C-51.4,-32.8,-48.6,-48,-39.6,-54.2C-30.6,-60.5,-15.3,-57.9,-2.7,-54.2C9.9,-50.5,19.9,-45.8,34.3,-41.2Z" transform="translate(100 100)" />
                </svg>

                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={styles.s2}>
                    <path d="M46.3,-64.1C56.4,-56.4,58.5,-38,64.7,-20.6C70.9,-3.2,81.4,13.3,76.9,24.4C72.5,35.4,53.1,40.9,37.8,49.4C22.5,58,11.2,69.5,-2.7,73.2C-16.6,76.9,-33.3,72.8,-46.1,63.5C-58.9,54.1,-67.8,39.5,-68.6,25.1C-69.5,10.6,-62.3,-3.6,-58.9,-20.7C-55.5,-37.8,-56,-57.8,-46.8,-65.7C-37.7,-73.7,-18.8,-69.6,-0.4,-69.1C18.1,-68.6,36.2,-71.7,46.3,-64.1Z" transform="translate(100 100)" />
                </svg>
            </div>

            <div className={styles.right}>
                <h1>ERROR!</h1>
                <h2>Page Not Found</h2>

                <p>
                    The page you're looking for does't exist or was moved. <br />
                    <span> Check the URL or go back safely.</span>
                </p>

                <div className={styles.actions}>
                    <button onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} />
                        Go Back
                    </button>

                    <button
                        className={styles.primary}
                        onClick={() => navigate('/dashboard')}
                    >
                        <Home size={16} />
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Error404;
