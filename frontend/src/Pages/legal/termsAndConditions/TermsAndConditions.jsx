import styles from './TermsAndConditions.module.css';

const TermsAndConditions = () => {
    return (
        <div className={styles.container}>
            <h1>Terms and Conditions</h1>
            <p className={styles.updated}>Last updated: January 25, 2026</p>

            <section>
                <h2>1. Introduction</h2>
                <p>
                    Welcome to the Timetable Generator website. By creating an account or
                    using this website, you agree to comply with and be bound by these
                    Terms and Conditions. If you do not agree, you must not use the
                    website.
                </p>
            </section>

            <section>
                <h2>2. Purpose of the Service</h2>
                <p>
                    This website provides a free and open-source timetable generation tool
                    intended primarily for educational institutions, including schools
                    and universities. The service is designed to assist with timetable
                    planning and organization.
                </p>
            </section>

            <section>
                <h2>3. Accounts and Access</h2>
                <p>
                    To use certain features of the website, you must create an account.
                    You are responsible for maintaining the confidentiality of your login
                    credentials and for all activities that occur under your account.
                </p>
            </section>

            <section>
                <h2>4. Data Collection and Storage</h2>
                <p>
                    By using this website, you acknowledge and agree that we store data
                    provided by you, including but not limited to:
                </p>
                <ul>
                    <li>Generated timetables</li>
                    <li>Teacher details</li>
                    <li>Class information</li>
                    <li>Subject details</li>
                </ul>
                <p>
                    This data is stored solely to provide and improve the functionality
                    of the service.
                </p>
            </section>

            <section>
                <h2>5. Cookies and Authentication</h2>
                <p>
                    We use cookies to manage authentication, including storing access and
                    refresh tokens. These cookies are necessary for the proper operation
                    of user sessions and account security. By using the website, you
                    consent to the use of such cookies.
                </p>
            </section>

            <section>
                <h2>6. Open-Source License</h2>
                <p>
                    This project is free and open-source. The source code is publicly
                    available on GitHub at:
                </p>
                <p>
                    <a
                        href="https://github.com/viswajith275/TimeTable-Generator"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://github.com/viswajith275/TimeTable-Generator
                    </a>
                </p>
                <p>
                    Use, modification, and distribution of the source code are governed
                    by the license specified in the repository.
                </p>
            </section>

            <section>
                <h2>7. Accuracy and Responsibility</h2>
                <p>
                    While we aim to provide reliable timetable generation, we do not
                    guarantee that generated timetables will be free from conflicts or
                    suitable for every institutional requirement. Users are responsible
                    for reviewing and validating outputs before use.
                </p>
            </section>

            <section>
                <h2>8. Acceptable Use</h2>
                <p>
                    You agree not to misuse the website, attempt unauthorized access,
                    disrupt services, or use the platform for unlawful purposes.
                </p>
            </section>

            <section>
                <h2>9. Disclaimer</h2>
                <p>
                    The website is provided on an "as is" and "as available" basis without
                    warranties of any kind. We do not guarantee uninterrupted access or
                    error-free operation.
                </p>
            </section>

            <section>
                <h2>10. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, we shall not be liable for any
                    direct or indirect damages arising from the use of or inability to
                    use this website or its generated outputs.
                </p>
            </section>

            <section>
                <h2>11. Changes to These Terms</h2>
                <p>
                    We reserve the right to update these Terms and Conditions at any time.
                    Continued use of the website after changes are posted constitutes
                    acceptance of the revised terms.
                </p>
            </section>

            <section>
                <h2>12. Contact</h2>
                <p>
                    For questions or concerns regarding these Terms and Conditions, please
                    contact us through the website or via the GitHub repository.
                </p>
            </section>
        </div>
    );
};

export default TermsAndConditions;
