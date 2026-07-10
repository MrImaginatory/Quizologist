"use client";

import { useState, useEffect } from "react";
import styles from "../../../app/(dashboard)/faculties/Faculty.module.css";
import { contentService, Faculty } from "@/lib/contentService";
import { capitalize } from "@/utils/helpers";

export default function FacultyTab() {
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

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchFaculties = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await contentService.getFaculties(currentPage, limit);
      if (res.success && res.data) {
        setFaculties(res.data.faculties as Faculty[] || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching faculties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties(page);
  }, [page]);

  const handleOpenModal = (faculty?: Faculty) => {
    if (faculty) {
      setEditingId(faculty.id);
      setName(faculty.name);
      setDescription(faculty.description || "");
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty?")) return;
    try {
      await contentService.deleteFaculty(id);
      fetchFaculties(page);
    } catch (error: any) {
      console.error("Error deleting faculty:", error);
      alert(error.message || "Error deleting faculty");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await contentService.updateFaculty(editingId, name, description);
      } else {
        res = await contentService.createFaculty(name, description);
      }
      
      if ((res as any).success) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        setEditingId(null);
        if (!editingId) setPage(1);
        fetchFaculties(editingId ? page : 1);
      }
    } catch (error: any) {
      console.error("Error saving faculty:", error);
      alert(error.message || "Error saving faculty");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>All Faculties</h2>
        <button className={styles.addButton} onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Faculty
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : faculties.length === 0 ? (
          <div className={styles.emptyState}>No faculties found.</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((f) => (
                  <tr key={f.id}>
                    <td>{capitalize(f.name)}</td>
                    <td className={styles.descriptionCell} title={f.description || ""}>{f.description || "-"}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className={styles.editBtn} onClick={() => handleOpenModal(f)}>
                          <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                          <span className={styles.btnText}>Edit</span>
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(f.id)}>
                          <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          <span className={styles.btnText}>Delete</span>
                        </button>
                      </div>
                    </td>
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
              <h2>{editingId ? "Edit Faculty" : "Add New Faculty"}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Faculty Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Computer Science"
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
                <button type="submit" className={styles.submitButton} disabled={submitting || !name.trim()}>
                  {submitting ? "Saving..." : (editingId ? "Update Faculty" : "Save Faculty")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
