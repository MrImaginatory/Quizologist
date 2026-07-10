"use client";

import { useState, useEffect } from "react";
import styles from "./Students.module.css";
import { contentService, Faculty, Subject, Topic } from "@/lib/contentService";
import { capitalize } from "@/utils/helpers";

interface Student {
  id: string;
  fname: string;
  lname: string;
  email: string;
  mobilenumber: string;
  role: string;
  createdAt: string;
  enrollments?: Enrollment[];
}

interface Enrollment {
  id: string;
  student_id: string;
  faculty_id: string;
  subject_id: string | null;
  topic_id: string | null;
  faculty?: { id: string; name: string };
  subject?: { id: string; name: string };
  topic?: { id: string; name: string };
}

export default function StudentsPage() {
  // Filter state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch faculties on mount
  useEffect(() => {
    const init = async () => {
      try {
        const res = await contentService.getFaculties(1, 100);
        if (res.success && res.data) {
          setFaculties((res.data.faculties as Faculty[]) || []);
        }
      } catch (err) {
        console.error("Error fetching faculties:", err);
      }
    };
    init();
  }, []);

  // Fetch subjects when faculty changes
  useEffect(() => {
    setSelectedSubject("");
    setSelectedTopic("");
    setSubjects([]);
    setTopics([]);

    if (!selectedFaculty) return;

    const fetchSubjects = async () => {
      try {
        const res = await contentService.getSubjectsByFaculty(
          selectedFaculty,
          1,
          100
        );
        if (res.success && res.data) {
          setSubjects((res.data.subjects as Subject[]) || []);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, [selectedFaculty]);

  // Fetch topics when subject changes
  useEffect(() => {
    setSelectedTopic("");
    setTopics([]);

    if (!selectedSubject) return;

    const fetchTopics = async () => {
      try {
        const res = await contentService.getTopicsBySubject(
          selectedSubject,
          1,
          100
        );
        if (res.success && res.data) {
          setTopics((res.data.topics as Topic[]) || []);
        }
      } catch (err) {
        console.error("Error fetching topics:", err);
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  // Fetch students
  const handleShowStudents = async (currentPage = 1) => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", String(limit));

      if (selectedFaculty) params.append("faculty_id", selectedFaculty);
      if (selectedSubject) params.append("subject_id", selectedSubject);
      if (selectedTopic) params.append("topic_id", selectedTopic);

      const token = localStorage.getItem("quizologist_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/enrollment/students?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setStudents(data.data.students || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotal(data.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      // Fallback to user service
      try {
        const token = localStorage.getItem("quizologist_token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/user/role/student?page=${currentPage}&limit=${limit}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        const data = await response.json();
        if (data.success && data.data) {
          setStudents(data.data.users || []);
          setTotalPages(data.data.pagination?.totalPages || 1);
          setTotal(data.data.pagination?.total || 0);
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (students.length > 0 || page > 1) {
      handleShowStudents(page);
    }
  }, [page]);

  const getInitials = (fname: string, lname: string) => {
    return `${fname[0]}${lname[0]}`.toUpperCase();
  };

  const getEnrollmentCount = (student: Student) => {
    return student.enrollments?.length || 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Students</h1>
          <p>View and manage student enrollments</p>
        </div>
        {/* <div className={styles.headerRight}>
          <div className={styles.statsBadge}>
            <span className={styles.statsNumber}>{total}</span>
            <span className={styles.statsLabel}>Total Students</span>
          </div>
        </div> */}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label>Faculty</label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
          >
            <option value="">All Faculties</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {capitalize(f.name)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedFaculty}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {capitalize(s.name)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedSubject}
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {capitalize(t.name)}
              </option>
            ))}
          </select>
        </div>

        <button
          className={styles.showBtn}
          onClick={() => {
            setPage(1);
            handleShowStudents(1);
          }}
          style={{ marginLeft: "auto" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Show Students
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading students...</div>
        ) : students.length === 0 ? (
          <div className={styles.emptyState}>
            Click &quot;Show Students&quot; to load data or adjust filters.
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Enrollments</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className={styles.studentInfo}>
                        <div className={styles.avatar}>
                          {getInitials(student.fname, student.lname)}
                        </div>
                        <div className={styles.studentName}>
                          <span className={styles.name}>
                            {capitalize(student.fname)}{" "}
                            {capitalize(student.lname)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.emailCell}>{student.email}</td>
                    <td>{student.mobilenumber}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeEnrollment}`}>
                        {getEnrollmentCount(student)} courses
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button
                          className={styles.viewBtn}
                          title="View student details"
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
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span className={styles.btnText}>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <span className={styles.paginationText}>
                Page {page} of {totalPages} ({total} students)
              </span>
              <div className={styles.paginationControls}>
                <button
                  className={styles.pageButton}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className={styles.pageButton}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
