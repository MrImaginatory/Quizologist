import { ReactNode } from "react";
import BrandPanel from "./BrandPanel";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <BrandPanel />
      <main className={styles.formPanel}>
        <div className={styles.formContent}>{children}</div>
      </main>
    </div>
  );
}
