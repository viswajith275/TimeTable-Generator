import { useState } from "react";
import styles from "./Login.module.css";
import { LockKeyhole, Eye, EyeOff, User, Mail } from "lucide-react";
import logoSmall from "../../assets/logo_small.png";
import { Link } from "react-router-dom";
import googleImg from "./img/googlel.webp";
import axios from "axios";
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorStates, setErrorStates] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errors };
    const newErrorStates = { ...errorStates };

    // USERNAME
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
      newErrorStates.username = true;
      hasError = true;
    } else {
      newErrorStates.username = false;
    }

    // EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      newErrorStates.email = true;
      hasError = true;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email address";
      newErrorStates.email = true;
      hasError = true;
    } else {
      newErrorStates.email = false;
    }

    // PASSWORD
    if (!form.password) {
      newErrors.password = "Enter a password";
      newErrorStates.password = true;
      hasError = true;
    } else if (form.password.length < 6) {
      newErrors.password = "Password too short";
      newErrorStates.password = true;
      hasError = true;
    } else {
      newErrorStates.password = false;
    }

    // CONFIRM PASSWORD
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
      newErrorStates.confirmPassword = true;
      hasError = true;
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
      newErrorStates.confirmPassword = true;
      hasError = true;
    } else {
      newErrorStates.confirmPassword = false;
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);

    if (hasError) return;

    try {
      setSubmitLoading(true);

      // console.log("Register payload:", {
      //   username: form.username.trim(),
      //   email: form.email.trim().toLowerCase(),
      //   password: form.password,
      // });

      // backend integration here
      const { confirmPassword, ...formData } = form;
      const response = await axios.post("/api/register", formData);

      if (response.status === 200) {
        console.log("Registeration success!");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  return (
    <section className={styles.loginPage}>
      <div className={styles.right}>
        <img
          src={logoSmall}
          alt="Logo"
          width={50}
          style={{ alignSelf: "center" }}
        />

        <div className={styles.rightInfo}>
          <h3>Sign Up</h3>
          <p>Create a new account!</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* USERNAME */}
          <div className={styles.inputContainer}>
            <label htmlFor="username-register-page" className={styles.label}>
              <p>Username</p>
              <p
                className={`${styles.errorLabel} ${
                  errorStates.username ? "" : styles.hidden
                }`}
              >
                {errors.username}
              </p>
            </label>

            <div
              className={`${styles.inputField} ${
                errorStates.username ? styles.errorInputField : ""
              }`}
            >
              <User size={16} strokeWidth={1.75} />
              <input
                type="text"
                id="username-register-page"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className={styles.inputContainer}>
            <label htmlFor="email-register-page" className={styles.label}>
              <p>Email</p>
              <p
                className={`${styles.errorLabel} ${
                  errorStates.email ? "" : styles.hidden
                }`}
              >
                {errors.email}
              </p>
            </label>

            <div
              className={`${styles.inputField} ${
                errorStates.email ? styles.errorInputField : ""
              }`}
            >
              <Mail size={16} strokeWidth={1.75} />
              <input
                type="email"
                id="email-register-page"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className={styles.inputContainer}>
            <label htmlFor="password-register-page" className={styles.label}>
              <p>Password</p>
              <p
                className={`${styles.errorLabel} ${
                  errorStates.password ? "" : styles.hidden
                }`}
              >
                {errors.password}
              </p>
            </label>

            <div
              className={`${styles.inputField} ${
                errorStates.password ? styles.errorInputField : ""
              }`}
            >
              <LockKeyhole size={16} strokeWidth={1.75} />
              <input
                type={showPassword ? "text" : "password"}
                id="password-register-page"
                placeholder="●●●●●●●●"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          {/* CONFIRM PASSWORD */}
          <div className={styles.inputContainer}>
            <label
              htmlFor="confirm-password-register-page"
              className={styles.label}
            >
              <p>Confirm Password</p>
              <p
                className={`${styles.errorLabel} ${
                  errorStates.confirmPassword ? "" : styles.hidden
                }`}
              >
                {errors.confirmPassword}
              </p>
            </label>

            <div
              className={`${styles.inputField} ${
                errorStates.confirmPassword ? styles.errorInputField : ""
              }`}
            >
              <LockKeyhole size={16} strokeWidth={1.75} />
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password-register-page"
                placeholder="●●●●●●●●"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
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

        <p className={styles.newHere}>
          Already have an account?{" "}
          <Link to="/login" className={styles.newHereLink}>
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
