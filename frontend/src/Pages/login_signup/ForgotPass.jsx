import styles from "./Login.module.css";
import style2 from "./Forgot.module.css";
import logoSmall from "../../assets/logo_small.svg";

import { Mail, ChevronLeft } from "lucide-react";

const ForgotPass = () => {
  return (
    <section className={style2.reset__BIG_CONTAINER_TOCENTERDIV}>
      <div className={style2.resetPass__container}>
        <img src={logoSmall} alt="Logo" width={50} />

        <div>
          <h2>Reset password</h2>
          <p>We will send you an e-mail with your password reset link.</p>
        </div>

        <form noValidate>
          <div className={styles.inputContainer}>
            <label htmlFor="email-login-page" className={styles.label}>
              <p>E-mail</p>
              {/* Error text placeholder (logic removed) */}
              <p className={`${styles.errorLabel} ${styles.hidden}`}>
                Invalid E-mail address
              </p>
            </label>

            <div className={styles.inputField}>
              <Mail size={16} strokeWidth={1.75} />
              <input
                type="email"
                id="email-login-page"
                placeholder="yourname@gmail.com"
                className={style2.email}
              />
            </div>
          </div>

          <button type="submit" className={styles.loginBtn}>
            Send email
          </button>
        </form>

        <div className={style2.backBtn}>
          <ChevronLeft strokeWidth={3} size={14} style={{ color: "#1c1c1e" }} />
          <p>Back</p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPass;
