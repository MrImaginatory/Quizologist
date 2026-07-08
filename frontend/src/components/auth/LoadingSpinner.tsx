import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={`${styles.spinner} ${styles[size]}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
