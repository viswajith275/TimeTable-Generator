import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BrainCircuit,
  Zap,
  RefreshCcw,
  MonitorSmartphone,
  GitBranch,
  CheckCircle,
  Send
} from "lucide-react";
import styles from "./LandingPage.module.css";
import logoFull from "../../assets/logo_full_width.png";

const FEATURES = [
  {
    title: "Smart Scheduling",
    desc: "Automatically resolves teacher, room, and subject conflicts.",
    icon: <BrainCircuit />,
  },
  {
    title: "Instant Generation",
    desc: "Create complete timetables in seconds, not hours.",
    icon: <Zap />,
  },
  {
    title: "Easy Regeneration",
    desc: "Make changes anytime and regenerate instantly.",
    icon: <RefreshCcw />,
  },
  {
    title: "Any Device",
    desc: "Works perfectly on desktop, tablet, and mobile.",
    icon: <MonitorSmartphone />,
  },
  {
    title: "Open Source",
    desc: "Transparent, free forever, community-driven.",
    icon: <GitBranch />,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const LandingPage = () => {
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll();

  const leftY = useTransform(scrollYProgress, [0, 0.5], [0, 300]);
  const leftX = useTransform(scrollYProgress, [0, 0.5], [0, 300]);

  const rightY = useTransform(scrollYProgress, [0, 0.1], [0, -80]);
  const rightX = useTransform(scrollYProgress, [0, 0.1], [0, -80]);
  
  const rotateLeft = useTransform(scrollYProgress, [0, 1], [100, -120]);
  const rotateRight = useTransform(scrollYProgress, [0, 1], [-100, -150]);

  return (
    <div className={styles.container}>
      {/* ================= HEADER ================= */}
      <header className={styles.header}>
        <img src={logoFull} alt="Logo" />

        <nav>
          <a>Features</a>
          <a>How it works</a>
          <a>Open Source</a>
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.secondary}
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
          <button
            className={styles.primary}
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main className={styles.main}>
        <section className={styles.hero}>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
          >
            Create Perfect Timetables.
            <br />
            Instantly.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            Generate optimized school timetables with zero conflicts.
            No spreadsheets. No stress. Completely free.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className={styles.heroActions}
          >
            <button
              className={styles.primaryLarge}
              onClick={() => navigate("/register")}
            >
              Get Started Free <ArrowUpRight />
            </button>
            <span className={styles.trustText}>
              Open-source • No credit card
            </span>
          </motion.div>
        </section>

        {/* ================= SOCIAL PROOF ================= */}
        <section className={styles.socialProof}>
          <p>Built for educators • Designed for real classrooms</p>
        </section>

        {/* ================= PROBLEM / SOLUTION ================= */}
        <section className={styles.problemSolution}>
          <motion.div
            className={styles.problem}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3>The Problem</h3>
            <ul>
              <li>Manual scheduling takes days</li>
              <li>One change breaks everything</li>
              <li>Teacher & room conflicts</li>
              <li>Endless adjustments</li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.solution}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3>The Solution</h3>
            <ul>
              <li>One-click timetable generation</li>
              <li>Automatic conflict resolution</li>
              <li>Instant regeneration</li>
              <li>Clean, exportable schedules</li>
            </ul>
          </motion.div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className={styles.howItWorks}>
          <h2>How It Works</h2>

          <div className={styles.steps}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span>1</span>
              <p>Enter subjects, teachers, rooms, and constraints</p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span>2</span>
              <p>Generate your timetable instantly</p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span>3</span>
              <p>Edit, regenerate, and export anytime</p>
            </motion.div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className={styles.features}>
          <h2>Why You'll Love It</h2>

          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className={styles.featureCard}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.icon}>{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= OPEN SOURCE ================= */}
        <section className={styles.openSource}>
          <CheckCircle size={32} />
          <h2>Free. Open-source. Transparent.</h2>
          <p>
            No paywalls. No limits. Built with the community and maintained
            openly on GitHub.
          </p>
          <button className={styles.secondary}>
            View GitHub
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z" /></svg>
          </button>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className={styles.finalCta}>
          <h2>Start generating timetables today</h2>
          <button
            className={styles.primaryLarge}
            onClick={() => navigate("/register")}
          >
            Get Started — Free
          </button>
          <span>Takes less than a minute</span>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <img src={logoFull} alt="Logo" />
        <nav>
          <a>About</a>
          <a>GitHub</a>
          <a>Privacy</a>
          <a>Terms</a>
          <a>Contact</a>
        </nav>
        <span>&copy; 2025-26 All rights reserved.</span>
      </footer>

      {/* ================= Illustrations ================= */}
      <div className={styles.illustrationContainer}>
        <motion.div
          className={styles.paperPlaneLeft}
          style={{ y: leftY, x: leftX, rotate: rotateLeft, transformOrigin: "center center", transition: "transform 0.1s linear" }}
        >
          <Send size={150} />
        </motion.div>

        <motion.div
          className={styles.paperPlaneRight}
          style={{ y: rightY, x: rightX, rotate: rotateRight, transformOrigin: "center center", transition: "transform 0.1s linear" }}
        >
          <Send size={60} />
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;