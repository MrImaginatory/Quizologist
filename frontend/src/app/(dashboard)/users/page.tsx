"use client";

import { useState, useEffect } from "react";
import styles from "./Users.module.css";
import { capitalize } from "@/utils/helpers";
import { userService, User } from "@/lib/userService";
import DataTable from "@/components/common/DataTable/DataTable";
import Pagination from "@/components/common/Pagination/Pagination";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [filterRole, setFilterRole] = useState<string>("all"); // 'all', 'student', 'teacher'

  const fetchUsers = async (currentPage: number, currentRole: string) => {
    try {
      setLoading(true);
      let res;
      if (currentRole === "all") {
        res = await userService.getAllUsers(currentPage, limit);
      } else {
        res = await userService.getUsersByRole(currentRole, currentPage, limit);
      }
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, filterRole);
  }, [page, filterRole]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  const getInitials = (fname: string, lname: string) => {
    return `${fname[0] || ""}${lname[0] || ""}`.toUpperCase();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Users Management</h1>
          <p>View and manage all registered users</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.filterGroup}>
            <label htmlFor="roleFilter">Filter by Role:</label>
            <select 
              id="roleFilter" 
              value={filterRole} 
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </select>
          </div>
          <div className={styles.statsBadge}>
            <span className={styles.statsNumber}>{total}</span>
            <span className={styles.statsLabel}>Total Users</span>
          </div>
        </div>
      </div>

      <DataTable
        columns={["User", "Email", "Mobile", "Role"]}
        loading={loading}
        loadingMessage="Loading users..."
        isEmpty={users.length === 0}
        emptyMessage="No users found."
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
                    <td>
                      <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : user.role === 'teacher' ? styles.badgeTeacher : styles.badgeStudent}`}>
                        {capitalize(user.role)}
                      </span>
                    </td>
                  </tr>
        ))}
      </DataTable>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
