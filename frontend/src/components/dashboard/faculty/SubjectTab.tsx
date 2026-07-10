"use client";

import { useState, useEffect } from "react";
import styles from "../../../app/(dashboard)/faculty/Faculty.module.css";
import { contentService, Subject, Faculty } from "@/lib/contentService";

export default function SubjectTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [facultyId, setFacultyId] = useState("");

  const fetchSubjects = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await contentService.getSubjects(currentPage, limit);
      if (res.success && res.data) {
        setSubjects(res.data.subjects as Subject[] || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultiesForDropdown = async () => {
    try {
      // Get a large limit to populate dropdown
      const res = await contentService.getFaculties(1, 100);
      if (res.success && res.data) {
        setFaculties(res.data.faculties as Faculty[] || []);
      }
    } catch (error) {
      console.error("Error fetching faculties for dropdown:", error);
    }
  };

  useEffect(() => {
    fetchSubjects(page);
    fetchFacultiesForDropdown();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !facultyId) return;

    try {
      setSubmitting(true);
      const res = await contentService.createSubject(name, facultyId, description);
      if ((res as any).success) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        setFacultyId("");
        setPage(1);
        fetchSubjects(1);
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      alert("Error creating subject");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>All Subjects</h2>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Subject
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : subjects.length === 0 ? (
          <div className={styles.emptyState}>No subjects found.</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Faculty</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.faculty?.name || s.faculty_id}</td>
                    <td>{s.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <span className={styles.paginationText}>
                Page {page} of {totalPages}
              </span>
              <div className={styles.paginationControls}>
                <button 
                  className={styles.pageButton} 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <button 
                  className={styles.pageButton} 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add New Subject</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Faculty *</label>
                <select 
                  value={facultyId} 
                  onChange={(e) => setFacultyId(e.target.value)} 
                  required
                >
                  <option value="">Select a Faculty</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Subject Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Data Structures"
                  maxLength={100}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={submitting || !name.trim() || !facultyId}>
                  {submitting ? "Saving..." : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
