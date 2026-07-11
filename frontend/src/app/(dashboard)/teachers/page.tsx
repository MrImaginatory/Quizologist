"use client";

import { useState, useEffect } from "react";
import styles from "./Teachers.module.css";
import { capitalize } from "@/utils/helpers";
import { teacherService, TeacherProfile } from "@/lib/teacherService";
import AssignmentModal from "./AssignmentModal";
import DataTable from "@/components/common/DataTable/DataTable";
import Pagination from "@/components/common/Pagination/Pagination";

export default function TeachersPage() {
  const [users, setUsers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal State
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);

  const fetchUsers = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await teacherService.getTeachersList(currentPage, limit);
      if (res.success && res.data) {
        setUsers(res.data.teachers || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const getInitials = (fname: string, lname: string) => {
    return `${fname[0] || ""}${lname[0] || ""}`.toUpperCase();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Teachers Management</h1>
          <p>Assign faculties and subjects to teachers</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.statsBadge}>
            <span className={styles.statsNumber}>{total}</span>
            <span className={styles.statsLabel}>Total Teachers</span>
          </div>
        </div>
      </div>

      <DataTable
        columns={["Teacher", "Email", "Mobile", "Assignments", "Actions"]}
        loading={loading}
        loadingMessage="Loading teachers..."
        isEmpty={users.length === 0}
        emptyMessage="No teachers found."
      >
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {getInitials(user.fname, user.lname)}
                </div>
                <div className={styles.userName}>
                  <span className={styles.name}>
                    {capitalize(user.fname)} {capitalize(user.lname)}
                  </span>
                </div>
              </div>
            </td>
            <td className={styles.emailCell}>{user.email}</td>
            <td>{user.mobileNumber}</td>
            <td title={`${user.facultyCount || 0} Faculty, ${user.subjectCount || 0} Subjects`}>
              <span className={`${styles.badge} ${styles.badgeEnrollment}`}>
                {user.totalAssignments || 0} assigned
              </span>
            </td>
            <td>
              <div className={styles.tableActions}>
                <button
                  className={styles.viewBtn}
                  title="Manage assignments"
                  onClick={() => setSelectedTeacher(user)}
                >
                  <svg
                    className={styles.btnIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span className={styles.btnText}>Assign</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedTeacher && (
        <AssignmentModal
          teacherId={selectedTeacher.id}
          teacherName={`${capitalize(selectedTeacher.fname)} ${capitalize(selectedTeacher.lname)}`}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  );
}
