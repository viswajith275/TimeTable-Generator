import { useState } from "react";
import styles from "./Login.module.css";
import { User, LockKeyhole, Eye, EyeOff } from "lucide-react";
import logoSmall from "../../assets/logo_small.png";
import googleImg from "./img/googlel.webp";
import { useAuth } from "../../Context/AuthProvider";
import { Link } from "react-router-dom";
import axios from "axios";
const Login = () => {
  const { confirmLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [errorStates, setErrorStates] = useState({
    username: false,
    password: false,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errors };
    const newErrorStates = { ...errorStates };

    // Username validation
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
      newErrorStates.username = true;
      hasError = true;
    } else {
      newErrorStates.username = false;
    }

    // Password validation
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

    setErrors(newErrors);
    setErrorStates(newErrorStates);

    if (hasError) return;

    try {
      setSubmitLoading(true);

      const formData = new URLSearchParams();
      /*URL search params thingy is used here coz the application 
      accepts only url encoded stuff.. it doesnt accepts json type shit here.*/
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
    } catch (err) {
      console.log(err.detail);
      if (err.status === 400) {
        setErrorStates({
          username: true,
          password: true,
        });
        setErrors({
          username: "Incorrect username or password",
          password: "Incorrect username or password",
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
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
          <h3>Login</h3>
          <p>Please login to your account!</p>
        </div>

        <form noValidate onSubmit={handleLogin}>
          {/* USERNAME */}
          <div className={styles.inputContainer}>
            <label htmlFor="username-login-page" className={styles.label}>
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
                id="username-login-page"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className={styles.inputContainer}>
            <label htmlFor="password-login-page" className={styles.label}>
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
                id="password-login-page"
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

        <p className={styles.newHere}>
          New here?
          <Link to={"/register"} className={styles.newHereLink}>
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
