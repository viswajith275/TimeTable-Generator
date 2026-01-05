import { useState } from "react";
import styles from "./Login.module.css";
import { Mail, LockKeyhole, User, Eye, EyeOff } from "lucide-react";
import logoSmall from "../../assets/logo_small.png";
import logoBig from "../../assets/logo_full_width.png";
import sidePanel from "./img/side_panel.png";
import googleImg from "../../assets/googlel.webp";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [nameErrorState, setNameErrorState] = useState(false);
  const [emailErrorState, setEmailErrorState] = useState(false);
  const [passwordErrorState, setPasswordErrorState] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    // NAME VALIDATION
    if (!name.trim()) {
      setNameError("Name is required");
      setNameErrorState(true);
      hasError = true;
    } else {
      setNameErrorState(false);
    }

    // EMAIL VALIDATION
    if (!email) {
      setEmailError("E-mail is required");
      setEmailErrorState(true);
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid E-mail address");
      setEmailErrorState(true);
      hasError = true;
    } else {
      setEmailErrorState(false);
    }

    // PASSWORD VALIDATION
    if (!password) {
      setPasswordError("Enter a password");
      setPasswordErrorState(true);
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password too short");
      setPasswordErrorState(true);
      hasError = true;
    } else {
      setPasswordErrorState(false);
    }

    if (hasError) return;

    try {
      setSubmitLoading(true);

      //  JWT SIGNUP API GOES HERE
      console.log("Register payload:", { name, email, password });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    //  Google OAuth / JWT flow later
    console.log("Google signup clicked");
  };

  return (
    <section className={styles.loginPage}>
      <div className={styles.loginPageContainer}>
        {/* LEFT PANEL */}
        <div className={styles.left}>
          <img width="200px" src={logoBig} alt="Logo" />
          <img width="400px" src={sidePanel} alt="Illustration" />

          <h2>
            <span>Welcome to Lorum</span> Lorem ipsum dolor sit amet
          </h2>

          <p>
            Already have an account? <a href="#login">Login</a>
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.right}>
          <img src={logoSmall} alt="Logo" width={50} />

          <div className={styles.rightInfo}>
            <h3>Sign Up</h3>
            <p>Create a new account!</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* NAME */}
            <div className={styles.inputContainer}>
              <label htmlFor="name-register-page" className={styles.label}>
                <p>Your Name</p>
                <p
                  className={`${styles.errorLabel} ${
                    nameErrorState ? "" : styles.hidden
                  }`}
                >
                  {nameError}
                </p>
              </label>

              <div
                className={`${styles.inputField} ${
                  nameErrorState ? styles.errorInputField : ""
                }`}
              >
                <User size={16} strokeWidth={1.75} />
                <input
                  type="text"
                  id="name-register-page"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameErrorState(false);
                  }}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className={styles.inputContainer}>
              <label htmlFor="email-register-page" className={styles.label}>
                <p>E-mail</p>
                <p
                  className={`${styles.errorLabel} ${
                    emailErrorState ? "" : styles.hidden
                  }`}
                >
                  {emailError}
                </p>
              </label>

              <div
                className={`${styles.inputField} ${
                  emailErrorState ? styles.errorInputField : ""
                }`}
              >
                <Mail size={16} strokeWidth={1.75} />
                <input
                  type="email"
                  id="email-register-page"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailErrorState(false);
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className={styles.inputContainer}>
              <label htmlFor="password-register-page" className={styles.label}>
                <p>Password</p>
                <p
                  className={`${styles.errorLabel} ${
                    passwordErrorState ? "" : styles.hidden
                  }`}
                >
                  {passwordError}
                </p>
              </label>

              <div
                className={`${styles.inputField} ${
                  passwordErrorState ? styles.errorInputField : ""
                }`}
              >
                <LockKeyhole size={16} strokeWidth={1.75} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password-register-page"
                  placeholder="●●●●●●●●"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordErrorState(false);
                  }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.75} />
                  ) : (
                    <Eye size={16} strokeWidth={1.75} />
                  )}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className={`${styles.loginBtn} ${
                submitLoading ? styles.submitBtn__loading : ""
              }`}
            >
              Sign Up
            </button>
          </form>

          <p className={styles.or}>Or</p>

          <button className={styles.googleLogin} onClick={handleGoogleSignup}>
            <img width={20} src={googleImg} alt="Google logo" />
            <p>Sign up with Google</p>
          </button>

          {/* MOBILE TOGGLE */}
          <p className={styles.mobileToggle}>
            Already have an account?{" "}
            <a href="#login" className={styles.mobileToggleLink}>
              Login
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
