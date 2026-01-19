import styles from "./LandingPage.module.css";
import logoFull from "../../assets/logo_full_width.png";
import {
  ChevronDown,
  X,
  Check,
  ArrowUpRight,
  BrainCircuit,
  Zap,
  ListRestart,
  Sheet,
  MonitorSmartphone,
} from "lucide-react";
import FeatureItem from "./Components/FeatureItem";

const LandingPage = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <a href="#">
          <img src={logoFull} alt="Logo" />
        </a>

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

      <main className={styles.main}>
        <div className={styles.overflowOverlay}></div>

        <section className={styles.hero}>
          <h1>Lorem Ipsum</h1>
          <p>
            “Automatically generate optimized timetables based on your needs for{" "}
            <u>FREE.</u>”
          </p>
          <button className={`${styles.action} ${styles.primary} ${styles.B1}`}>
            Get Started
            <ArrowUpRight />
          </button>
          <p>
            already have an account? <a>Log in</a>
          </p>
        </section>

        <h2> # Designed for You.</h2>
        <div className={styles.features}>
          <FeatureItem
            message={"Smart Algorithm"}
            descr={`Automatically balances subjects, teachers, and rooms.`}
            icon={<BrainCircuit />}
          ></FeatureItem>

          <FeatureItem
            message={"Instant Generation"}
            descr={"Create complete timetables in seconds."}
            icon={<Zap />}
            iconFirst={true}
          ></FeatureItem>

          <FeatureItem
            message={"Easy Regeneration"}
            descr={"Make changes and regenerate instantly."}
            icon={<ListRestart />}
          ></FeatureItem>

          <FeatureItem
            message={"Clear Visual View"}
            descr={"Timetables that are easy to read and export."}
            icon={<Sheet />}
            iconFirst={true}
          ></FeatureItem>

          <FeatureItem
            message={"Works on Any Device"}
            descr={"Mobile, tablet, desktop friendly."}
            icon={<MonitorSmartphone />}
          ></FeatureItem>
        </div>

        <h2> # Your schedule, optimized.</h2>
        <div className={styles.problemSolution}>
          <div className={styles.left}>
            <div className={styles.floatingSymbol}>
              <X />
            </div>
            Manual scheduling takes hours <br /> <br />
            Conflicts between teachers & rooms <br /> <br />
            Last-minute changes cause chaos
          </div>
          <div className={styles.right}>
            <div className={styles.floatingSymbol}>
              <Check />
            </div>
            One-click timetable generation <br /> <br />
            Automatic conflict resolution <br /> <br />
            Easy edits & regeneration
          </div>
        </div>

        <h2> # See How It Works</h2>

        {/* finish this landing page */}
      </main>

      <div className={styles.footer}>
        <img src={logoFull} />
        <br />
        <nav>
          <a>about</a> &middot;
          <a>contact</a> &middot;
          <a>privacy policy</a> &middot;
          <a>terms and conditions</a> &middot;
          <a>Github repo</a>
        </nav>
        <br /> <br />
        <span>&copy; 2025-26 All rights reserved.</span>
        <span className={styles.extras}>
          <a>cookie preference</a>
          <a>security</a>
          <a>legal</a>
          <a>privacy</a>
        </span>
      </div>
    </div>
  );
};

export default LandingPage;
