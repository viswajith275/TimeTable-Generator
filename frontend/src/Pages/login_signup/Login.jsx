import { useState } from "react";
import styles from "./Login.module.css";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import logoSmall from "../../assets/logo_small.png";
import logoBig from "../../assets/logo_full_width.png";
import sidePanel from "./img/side_panel.png";
import googleImg from "./img/googlel.webp";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [emailErrorState, setEmailErrorState] = useState(false);
  const [passwordErrorState, setPasswordErrorState] = useState(false);
  const [emailError, setEmailError] = useState("Invalid email address");
  const [passwordError, setPasswordError] = useState("Password too short");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // JWT login placeholder
  const handleLogin = async (e) => {
    e.preventDefault();

    let hasError = false;

    // Email validation
    if (!email) {
      setEmailErrorState(true);
      setEmailError("E-mail is required.");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailErrorState(true);
      setEmailError("Invalid E-mail address.");
      hasError = true;
    }

    // Password validation
    if (!password) {
      setPasswordErrorState(true);
      setPasswordError("Enter a password");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordErrorState(true);
      setPasswordError("Password too short");
      hasError = true;
    }

    if (hasError) return;

    try {
      setSubmitLoading(true);

      // 🔐 JWT API CALL GOES HERE
      console.log("Login payload:", { email, password });
    } catch (err) {
      console.log(err);
    }
    // } finally {
    //   setSubmitLoading(false);
    // }
  };

  const handleGoogleLogin = () => {
    // 🔐 Google OAuth / JWT flow later
    console.log("Google login clicked");
  };

  return (
    <section className={styles.loginPage}>
      <div className={styles.loginPageContainer}>
        {/* LEFT PANEL */}
        <div className={styles.left}>
          <img width="200px" src={logoBig} alt="Logo" />
          <img width="400px" src={sidePanel} alt="Illustration" />

          <h2>
            <span>Welcome back</span> to Lorem Ipsum
          </h2>

          <p>
            New here? <a href="#register">Sign up</a>
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.right}>
          <img src={logoSmall} alt="Logo" width={50} />

          <div className={styles.rightInfo}>
            <h3>Login</h3>
            <p>Please login to your account!</p>
          </div>

          <form noValidate onSubmit={handleLogin}>
            {/* Email */}
            <div className={styles.inputContainer}>
              <label htmlFor="email-login-page" className={styles.label}>
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
                  id="email-login-page"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmailErrorState(false);
                    setEmail(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.inputContainer}>
              <label htmlFor="password-login-page" className={styles.label}>
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
                  id="password-login-page"
                  placeholder="●●●●●●●●"
                  value={password}
                  onChange={(e) => {
                    setPasswordErrorState(false);
                    setPassword(e.target.value);
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

            <p className={styles.forgotPass}>
              <a className="a-tag" href="#forgot-password">
                Forgot password?
              </a>
            </p>

            <button
              type="submit"
              disabled={submitLoading}
              className={`${styles.loginBtn} ${
                submitLoading ? styles.submitBtn__loading : ""
              }`}
            >
              Login
            </button>
          </form>

          <p className={styles.or}>Or</p>

          <button className={styles.googleLogin} onClick={handleGoogleLogin}>
            <img width={20} src={googleImg} alt="Google logo" />
            <p>Continue with Google</p>
          </button>

          {/* MOBILE TOGGLE */}
          <p className={styles.mobileToggle}>
            New here?{" "}
            <a href="#register" className={styles.mobileToggleLink}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
