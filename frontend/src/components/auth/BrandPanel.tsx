import styles from "./BrandPanel.module.css";

export default function BrandPanel() {
  return (
    <aside className={styles.brandPanel}>
      <div className={`${styles.decorCircle} ${styles.circle1}`} aria-hidden="true" />
      <div className={`${styles.decorCircle} ${styles.circle2}`} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            {process.env.NEXT_PUBLIC_LOGO ? (
              <img src={process.env.NEXT_PUBLIC_LOGO} alt="Logo" width={28} height={28} />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            )}
          </div>
          Quizologist
        </div>

        <h1 className={styles.heading}>
          Your journey to mastery starts here
        </h1>

        <p className={styles.subheading}>
          Join thousands of learners who are advancing their knowledge through
          interactive quizzes and comprehensive courses.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span>Track your progress across subjects</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span>Take quizzes tailored to your level</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span>Learn from detailed explanations</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
