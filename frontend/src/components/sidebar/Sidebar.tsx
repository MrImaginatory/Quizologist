"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getUser, clearAuth } from "@/lib/auth";
import type { User } from "@/types";
import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "My Enrollments", href: "/enrollments", icon: "enrollments" },
  { label: "Take Test", href: "/tests/start", icon: "test" },
  { label: "My Results", href: "/results", icon: "results" },
];

const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Faculties", href: "/faculties", icon: "faculties" },
  { label: "Subjects", href: "/subjects", icon: "subjects" },
  { label: "Topics", href: "/topics", icon: "topics" },
  { label: "Questions", href: "/questions", icon: "questions" },
  { label: "Tests", href: "/tests", icon: "tests" },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Faculties", href: "/faculties", icon: "faculties" },
  { label: "Subjects", href: "/subjects", icon: "subjects" },
  { label: "Topics", href: "/topics", icon: "topics" },
  { label: "Questions", href: "/questions", icon: "questions" },
  { label: "Students", href: "/students", icon: "students" },
  { label: "Tests", href: "/tests", icon: "tests" },
  { label: "Users", href: "/users", icon: "users" },
];

function NavIcon({ icon }: { icon: string }) {
  const svgProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "dashboard":
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "faculties":
      return (
        <svg {...svgProps}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "subjects":
      return (
        <svg {...svgProps}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      );
    case "topics":
      return (
        <svg {...svgProps}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case "questions":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "enrollments":
      return (
        <svg {...svgProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case "test":
    case "tests":
      return (
        <svg {...svgProps}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case "results":
      return (
        <svg {...svgProps}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "students":
      return (
        <svg {...svgProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "users":
      return (
        <svg {...svgProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
};

const logoSectionVariants = {
  expanded: { flexDirection: "row" as const, gap: "12px" },
  collapsed: { flexDirection: "column" as const, gap: "8px" },
};

const toggleIconVariants = {
  expanded: { rotate: 0 },
  collapsed: { rotate: 180 },
};

const navItemVariants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -8 },
};

const userSectionVariants = {
  expanded: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    padding: "16px",
  },
  collapsed: {
    flexDirection: "column" as const,
    justifyContent: "center",
    padding: "12px 8px",
  },
};

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const navItems = user?.role === "admin"
    ? ADMIN_NAV
    : user?.role === "teacher"
      ? TEACHER_NAV
      : STUDENT_NAV;

  const handleLogout = () => {
    clearAuth();
    router.push("/signin");
  };

  const getInitials = (u: User | null) => {
    if (!u) return "?";
    return `${u.fname[0]}${u.lname[0]}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "teacher":
        return "Teacher";
      case "student":
        return "Student";
      default:
        return role;
    }
  };

  const collapsedState = isCollapsed ? "collapsed" : "expanded";

  return (
    <motion.aside
      className={styles.sidebar}
      initial={false}
      animate={collapsedState}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      aria-label="Main navigation"
    >
      {/* Logo + Toggle */}
      <motion.div
        className={styles.logoSection}
        animate={collapsedState}
        variants={logoSectionVariants}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                className={styles.logoText}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Quizologist
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={collapsedState}
            variants={toggleIconVariants}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <polyline points="15 18 9 12 15 6" />
          </motion.svg>
        </motion.button>
      </motion.div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item, index) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

            return (
              <motion.li
                key={item.href}
                initial={false}
                animate={collapsedState}
                variants={{
                  expanded: { opacity: 1, x: 0 },
                  collapsed: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <a
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon}>
                    <NavIcon icon={item.icon} />
                  </span>
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        className={styles.navLabel}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </a>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <motion.div
        className={styles.userSection}
        animate={collapsedState}
        variants={userSectionVariants}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {getInitials(user)}
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                className={styles.userInfo}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className={styles.userName}>
                  {user ? `${user.fname} ${user.lname}` : "Guest"}
                </span>
                <span className={styles.userRole}>
                  {getRoleBadge(user?.role || "")}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Log out"
          title={isCollapsed ? "Log out" : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </motion.button>
      </motion.div>
    </motion.aside>
  );
}
