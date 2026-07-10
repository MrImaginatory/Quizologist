"use client";

import { useState, useEffect } from "react";
import styles from "../../../app/(dashboard)/faculties/Faculty.module.css";
import { contentService, Topic, Subject } from "@/lib/contentService";
import { capitalize } from "@/utils/helpers";

export default function TopicTab() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
  const [subjectId, setSubjectId] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTopics = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await contentService.getTopics(currentPage, limit);
      if (res.success && res.data) {
        setTopics(res.data.topics as Topic[] || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForDropdown = async () => {
    try {
      const res = await contentService.getSubjects(1, 100);
      if (res.success && res.data) {
        setSubjects(res.data.subjects as Subject[] || []);
      }
    } catch (error) {
      console.error("Error fetching subjects for dropdown:", error);
    }
  };

  useEffect(() => {
    fetchTopics(page);
    fetchSubjectsForDropdown();
  }, [page]);

  const handleOpenModal = (topic?: Topic) => {
    if (topic) {
      setEditingId(topic.id);
      setName(topic.name);
      setDescription(topic.description || "");
      setSubjectId(topic.subject_id);
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
      setSubjectId("");
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await contentService.deleteTopic(id);
      fetchTopics(page);
    } catch (error: any) {
      console.error("Error deleting topic:", error);
      alert(error.message || "Error deleting topic");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subjectId) return;

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await contentService.updateTopic(editingId, name, subjectId, description);
      } else {
        res = await contentService.createTopic(name, subjectId, description);
      }
      
      if ((res as any).success) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        setSubjectId("");
        setEditingId(null);
        if (!editingId) setPage(1);
        fetchTopics(editingId ? page : 1);
      }
    } catch (error: any) {
      console.error("Error saving topic:", error);
      alert(error.message || "Error saving topic");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h2>All Topics</h2>
        <button className={styles.addButton} onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Topic
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : topics.length === 0 ? (
          <div className={styles.emptyState}>No topics found.</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.id}>
                    <td>{capitalize(t.name)}</td>
                    <td>{t.subject?.name ? capitalize(t.subject.name) : t.subject_id}</td>
                    <td>{t.subject?.faculty?.name ? capitalize(t.subject.faculty.name) : "-"}</td>
                    <td className={styles.descriptionCell} title={t.description || ""}>{t.description || "-"}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className={styles.editBtn} onClick={() => handleOpenModal(t)}>
                          <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                          <span className={styles.btnText}>Edit</span>
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)}>
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
              <h2>{editingId ? "Edit Topic" : "Add New Topic"}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Subject *</label>
                <select 
                  value={subjectId} 
                  onChange={(e) => setSubjectId(e.target.value)} 
                  required
                >
                  <option value="">Select a Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{capitalize(s.name)} ({s.faculty?.name ? capitalize(s.faculty.name) : "-"})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Topic Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Binary Trees"
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
                <button type="submit" className={styles.submitButton} disabled={submitting || !name.trim() || !subjectId}>
                  {submitting ? "Saving..." : (editingId ? "Update Topic" : "Save Topic")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
