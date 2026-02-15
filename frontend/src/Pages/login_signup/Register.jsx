import { useState } from "react";
import styles from "./Login.module.css";
import { LockKeyhole, Eye, EyeOff, User, Mail } from "lucide-react";
import logoSmall from "../../assets/logo_small.svg";
import { Link } from "react-router-dom";
import googleImg from "./img/googlel.webp";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../Context/AuthProvider";

const Register = () => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [showPassword, setShowPassword] = useState(false);
  
  const { confirmLogin } = useAuth();

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

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    const newErrorStates = { ...errorStates };

    switch(fieldName){
      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
          newErrorStates.email = true;
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Invalid email address";
          newErrorStates.email = true;
        } else {
          newErrors.email = '';
          newErrorStates.email = false;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Enter a password";
          newErrorStates.password = true;
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
          newErrorStates.password = true;
        } else if (!passwordRegex.test(value)) {
          newErrors.password = "Include A-Z, a-z, 0-9 & symbol";
          newErrorStates.password = true;
        } else {
          newErrors.password = '';
          newErrorStates.password = false;
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = "Confirm your password";
          newErrorStates.confirmPassword = true;
        } else if (form.password !== value) {
          newErrors.confirmPassword = "Passwords do not match";
          newErrorStates.confirmPassword = true;
        } else {
          newErrors.confirmPassword = '';
          newErrorStates.confirmPassword = false;
        }
        break;

      case 'username':
        if (!value.trim()) {
          newErrors.username = "Username is required";
          newErrorStates.username = true;
        } else {
          newErrors.username = '';
          newErrorStates.username = false;
        }
        break;
      
        default:
          break;
    }

    setErrors(newErrors);
    setErrorStates(newErrorStates);
  }

  const validateAll = () => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let hasError = false;

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
      hasError = true;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email address";
      hasError = true;
    }

    if (!form.password) {
      newErrors.password = "Enter a password";
      hasError = true;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = "Include A-Z, a-z, 0-9 & symbol";
      hasError = true;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
      hasError = true;
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    setErrors(newErrors);
    setErrorStates({
      username: !!newErrors.username,
      email: !!newErrors.email,
      password: !!newErrors.password,
      confirmPassword: !!newErrors.confirmPassword,
    });

    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) return;
    
    try {
      setSubmitLoading(true);
      // backend integration here
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,
      };

      const response = await axios.post("/api/register", payload);

      if (response.status === 200) {
        toast.success("Registration successful!");
        setTimeout(() => {
          handleLogin();
        }, 1000);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setErrorStates({ ...errorStates, username: true, email: true });
        setErrors({
          ...errors,
          username: "Username or mail already in use.",
          email: "Username or mail already in use.",
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogin = async () => {
    const formData = new URLSearchParams();
    formData.append("username", form.username);
    formData.append("password", form.password);
    formData.append("grant_type", "password");
    formData.append("scope", "");
    formData.append("client_id", "");
    formData.append("client_secret", "");
    const response = await axios.post("/api/login", formData, {
      headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    });

    if (response.status == 200) {
      confirmLogin(form.username);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));

      if (errorStates[name]) {
        validateField(name, value);
      }
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
                name="username"
                value={form.username}
                onChange={handleChange}
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
                name="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                placeholder="Example@123"
                value={form.password}
                onChange={handleChange}
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
                name="confirmPassword"
                placeholder="Example@123"
                value={form.confirmPassword}
                onChange={handleChange}
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
