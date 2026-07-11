"use client";

import { useState, useEffect } from "react";
import styles from "../../../app/(dashboard)/faculties/Faculty.module.css";
import { contentService, Subject, Faculty } from "@/lib/contentService";
import { capitalize } from "@/utils/helpers";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import DataTable from "@/components/common/DataTable/DataTable";
import Pagination from "@/components/common/Pagination/Pagination";

export default function SubjectTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as string | null });
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [facultyId, setFacultyId] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingId(subject.id);
      setName(subject.name);
      setDescription(subject.description || "");
      setFacultyId(subject.faculty_id);
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
      setFacultyId("");
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await contentService.deleteSubject(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
      fetchSubjects(page);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : (error as { message?: string })?.message || "Error deleting subject";
      alert(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !facultyId) return;

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await contentService.updateSubject(editingId, name, facultyId, description);
      } else {
        res = await contentService.createSubject(name, facultyId, description);
      }

      if ((res as any).success) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        setFacultyId("");
        setEditingId(null);
        if (!editingId) setPage(1);
        fetchSubjects(editingId ? page : 1);
      }
    } catch (error: any) {
      console.error("Error saving subject:", error);
      alert(error.message || "Error saving subject");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>All Subjects</h2>
        <button className={styles.addButton} onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Subject
        </button>
      </div>

      <DataTable
        columns={["Name", "Description", "Faculty", "Actions"]}
        loading={loading}
        loadingMessage="Loading subjects..."
        isEmpty={subjects.length === 0}
        emptyMessage="No subjects found."
      >
        {subjects.map((s) => (
          <tr key={s.id}>
            <td>{capitalize(s.name)}</td>
            <td className={styles.descriptionCell} title={s.description || ""}>{s.description || "-"}</td>
            <td>
              {s.faculty?.name ? capitalize(s.faculty.name) : s.faculty_id}
            </td>
            <td>
              <div className={styles.tableActions}>
                <button className={styles.editBtn} onClick={() => handleOpenModal(s)}>
                  <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                  <span className={styles.btnText}>Edit</span>
                </button>
                <button className={styles.deleteBtn} onClick={() => confirmDelete(s.id)}>
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
      </DataTable>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Edit Subject" : "Add New Subject"}</h2>
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
                    <option key={f.id} value={f.id}>{capitalize(f.name)}</option>
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
                  {submitting ? "Saving..." : (editingId ? "Update Subject" : "Save Subject")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
