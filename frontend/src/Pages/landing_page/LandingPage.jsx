import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import styles from "./LandingPage.module.css";
import logoFull from "../../assets/logo_full_width.png";
import PopupInfo from "./Components/popupInfo/PopupInfo";
import {
    ChevronDown,
    X,
    Check,
    ArrowUpRight,
    Asterisk,
    RefreshCcw,
    BrainCircuit,
    Zap,
    ListRestart,
    Sheet,
    MonitorSmartphone,
} from "lucide-react";

import FeatureItem from "./Components/FeatureItem";

const FEATURES = [
    {
        message: "Smart Algorithm",
        descr: "Automatically balances subjects, teachers, and rooms.",
        icon: <BrainCircuit />,
    },
    {
        message: "Instant Generation",
        descr: "Create complete timetables in seconds.",
        icon: <Zap />,
        iconFirst: true,
    },
    {
        message: "Easy Regeneration",
        descr: "Make changes and regenerate instantly.",
        icon: <ListRestart />,
    },
    {
        message: "Clear Visual View",
        descr: "Timetables that are easy to read and export.",
        icon: <Sheet />,
        iconFirst: true,
    },
    {
        message: "Works on Any Device",
        descr: "Mobile, tablet, desktop friendly.",
        icon: <MonitorSmartphone />,
    },
];

const LandingPage = () => {

    const { scrollYProgress } = useScroll();

    const leftY = useTransform(scrollYProgress, [0, 0.4], [0, 400]);
    const leftX = useTransform(scrollYProgress, [0, 0.4], [0, -200]);

    const rightY = useTransform(scrollYProgress, [0, 0.4], [0, -400]);
    const rightX = useTransform(scrollYProgress, [0, 0.4], [0, 200]);

    const fadeOut = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    const rotateRight = useTransform(scrollYProgress, [0, 1], [180, -20]);

    const [FOpen, setFOpen] = useState(false);

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <img src={logoFull} alt="Logo" />

                <nav>
                    <a>
                        Explore <ChevronDown size={16} />
                    </a>
                    <a>Tutorial</a>
                    <a>Help</a>
                </nav>

                <nav className={styles.N2}>
                    <button className={`${styles.secondary} ${styles.action}`}>
                        Log in
                    </button>
                    <button className={`${styles.primary} ${styles.action}`}>
                        Sign up
                    </button>
                </nav>
            </header>

            {/* Main */}
            <main className={styles.main}>
                <div className={styles.overflowOverlay} />

                {/* Hero */}
                <section className={styles.hero}>
                    <h1>Lorem Ipsum</h1>
                    <p>
                        Automatically generate optimized timetables based on your needs for{" "}
                        <u 
                            onMouseEnter={() => setFOpen(true)}
                            onMouseLeave={() => setFOpen(false)}
                        >
                            FREE. 
                            <PopupInfo isOpen={FOpen}>Our service is completely free to use and open source. </PopupInfo>
                        </u>
                    </p>

                    <button className={`${styles.action} ${styles.primary} ${styles.B1}`}>
                        Get Started <ArrowUpRight />
                    </button>

                    <p>
                        already have an account? <a>Log in</a>
                    </p>
                </section>

                {/* Features */}
                <h2># Designed for You.</h2>
                <div className={styles.features}>
                    {FEATURES.map((feature, idx) => (
                        <FeatureItem key={idx} {...feature} />
                    ))}
                </div>

                {/* Problem / Solution */}
                <h2># Your schedule, optimized.</h2>
                <div className={styles.problemSolution}>
                    <div className={styles.left}>
                        <div className={styles.floatingSymbol}>
                            <X />
                        </div>
                        Manual scheduling takes hours <br /><br />
                        Conflicts between teachers & rooms <br /><br />
                        Last-minute changes cause chaos
                    </div>

                    <div className={styles.right}>
                        <div className={styles.floatingSymbol}>
                            <Check />
                        </div>
                        One-click timetable generation <br /><br />
                        Automatic conflict resolution <br /><br />
                        Easy edits & regeneration
                    </div>
                </div>

                <h2># See How It Works</h2>
                {/* TODO: demo / animation / steps */}
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <img src={logoFull} alt="Logo" />
                <br />

                <nav>
                    <a>about</a> &middot; <a>contact</a> &middot;
                    <a>privacy policy</a> &middot;
                    <a>terms and conditions</a> &middot;
                    <a>Github repo</a>
                </nav>

                <br /><br />

                <span>&copy; 2025-26 All rights reserved.</span>

                <span className={styles.extras}>
                    <a>cookie preference</a>
                    <a>security</a>
                    <a>legal</a>
                    <a>privacy</a>
                </span>
            </footer>

            {/* Decorative Symbols */}
            <div className={styles.illustrationContainer}>
                <motion.div
                    style={{
                        x: leftX,
                        y: leftY,
                        opacity: fadeOut,
                    }}
                >
                    <Asterisk className={styles.leftSymbol} color="tomato"/>
                </motion.div>

                <motion.div
                    style={{
                        x: rightX,
                        y: rightY,
                        opacity: fadeOut,
                    }}
                >
                    <Asterisk className={styles.rightSymbol} color="yellowgreen"/>
                </motion.div>

                <motion.div
                    style={{
                        rotate: rotateRight
                    }}
                    className={styles.line1}
                >
                    <RefreshCcw color="tomato" />
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
