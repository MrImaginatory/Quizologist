"use client";

import { useState, useEffect } from "react";
import styles from "./Teachers.module.css";
import { capitalize } from "@/utils/helpers";
import { userService, User } from "@/lib/userService";
import AssignmentModal from "./AssignmentModal";

export default function TeachersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const role = "teacher"; 

  // Modal State
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);

  const fetchUsers = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await userService.getUsersByRole(role, currentPage, limit);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
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

      <div className={styles.tableContainer}>
        {loading && users.length === 0 ? (
          <div className={styles.emptyState}>Loading teachers...</div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>No teachers found.</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
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
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={styles.assignBtn}
                          onClick={() => setSelectedTeacher(user)}
                        >
                          Manage Assignments
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <div className={styles.pageInfo}>
                  Showing page {page} of {totalPages}
                </div>
                <div className={styles.pageControls}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
