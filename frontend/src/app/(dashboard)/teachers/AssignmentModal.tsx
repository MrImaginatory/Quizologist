"use client";

import { useState, useEffect } from "react";
import styles from "./Teachers.module.css";
import { teacherService, TeacherAssignment } from "@/lib/teacherService";
import { contentService, Faculty, Subject } from "@/lib/contentService";
import { capitalize } from "@/utils/helpers";

interface Props {
  teacherId: string;
  teacherName: string;
  onClose: () => void;
}

export default function AssignmentModal({ teacherId, teacherName, onClose }: Props) {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Faculties & Subjects for assignment dropdowns
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Forms state
  const [activeTab, setActiveTab] = useState<"faculty" | "subject">("faculty");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load current assignments
      const assignRes = await teacherService.getTeacherAssignments(teacherId);
      if (assignRes.success && assignRes.data) {
        setAssignments(assignRes.data.assignments || []);
      }
      
      // Load faculties for dropdown
      const facRes = await contentService.getFaculties();
      if (facRes.success && facRes.data) {
        setFaculties(facRes.data.faculties || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId]);

  // When selected faculty in the "Assign Subject" tab changes, fetch subjects
  useEffect(() => {
    if (activeTab === "subject" && selectedFacultyId) {
      const fetchSubjects = async () => {
        try {
          const res = await contentService.getSubjectsByFaculty(selectedFacultyId);
          if (res.success && res.data) {
            setSubjects(res.data.subjects || []);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedFacultyId, activeTab]);

  const handleAssignFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId) return;
    
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      const res = await teacherService.assignFaculty(teacherId, selectedFacultyId);
      
      if (res.success) {
        setSuccess("Faculty assigned successfully!");
        setSelectedFacultyId("");
        loadData(); // Refresh assignments
      } else {
        setError(res.message || "Failed to assign faculty");
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId || !selectedSubjectId) return;
    
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      const res = await teacherService.assignSubject(teacherId, selectedFacultyId, selectedSubjectId);
      
      if (res.success) {
        setSuccess("Subject assigned successfully!");
        setSelectedSubjectId("");
        loadData(); // Refresh assignments
      } else {
        setError(res.message || "Failed to assign subject");
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;
    
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const res = await teacherService.removeAssignment(assignmentId);
      if (res.success) {
        setSuccess("Assignment removed!");
        loadData();
      } else {
        setError(res.message || "Failed to remove assignment");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Manage Assignments for {teacherName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {loading && assignments.length === 0 ? (
            <div className={styles.emptyState}>Loading assignments...</div>
          ) : (
            <>
              {/* Current Assignments */}
              <div className={styles.assignmentsList}>
                {assignments.length === 0 ? (
                  <div className={styles.emptyState} style={{ padding: "24px" }}>
                    No assignments found for this teacher.
                  </div>
                ) : (
                  assignments.map((fac) => (
                    <div key={fac.id} className={styles.assignmentCard}>
                      <div className={styles.assignmentCardHeader}>
                        <h3>{capitalize(fac.name)}</h3>
                        {fac.assignment_id && (
                           <button 
                             className={styles.removeBtn}
                             onClick={() => handleRemove(fac.assignment_id)}
                             disabled={loading}
                           >
                             Remove Faculty
                           </button>
                        )}
                      </div>
                      
                      {fac.subjects && fac.subjects.length > 0 ? (
                        <div className={styles.subjectsList}>
                          {fac.subjects.map((sub) => (
                            <div key={sub.id} className={styles.subjectItem}>
                              <span>{capitalize(sub.name)}</span>
                              {sub.assignment_id && (
                                <button 
                                  className={styles.removeBtn}
                                  onClick={() => handleRemove(sub.assignment_id)}
                                  disabled={loading}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          No subjects assigned in this faculty.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Assignment Forms */}
              <div className={styles.assignSection}>
                <h3>Assign New</h3>
                <div className={styles.tabs}>
                  <button 
                    className={`${styles.tab} ${activeTab === "faculty" ? styles.active : ""}`}
                    onClick={() => { setActiveTab("faculty"); setSelectedFacultyId(""); setError(""); setSuccess(""); }}
                  >
                    Assign Faculty
                  </button>
                  <button 
                    className={`${styles.tab} ${activeTab === "subject" ? styles.active : ""}`}
                    onClick={() => { setActiveTab("subject"); setSelectedFacultyId(""); setError(""); setSuccess(""); }}
                  >
                    Assign Subject
                  </button>
                </div>

                {activeTab === "faculty" && (
                  <form onSubmit={handleAssignFaculty}>
                    <div className={styles.formGroup}>
                      <label>Select Faculty</label>
                      <select 
                        className={styles.select}
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Faculty --</option>
                        {faculties.map((f) => (
                          <option key={f.id} value={f.id}>{capitalize(f.name)}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={submitting || !selectedFacultyId}>
                      {submitting ? "Assigning..." : "Assign Faculty"}
                    </button>
                  </form>
                )}

                {activeTab === "subject" && (
                  <form onSubmit={handleAssignSubject}>
                    <div className={styles.formGroup}>
                      <label>Select Faculty First</label>
                      <select 
                        className={styles.select}
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Assigned Faculty --</option>
                        {/* Only allow selecting faculties the teacher is already assigned to */}
                        {assignments.map((f) => (
                          <option key={f.id} value={f.id}>{capitalize(f.name)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Select Subject</label>
                      <select 
                        className={styles.select}
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        required
                        disabled={!selectedFacultyId || subjects.length === 0}
                      >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>{capitalize(s.name)}</option>
                        ))}
                      </select>
                      {selectedFacultyId && subjects.length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>No subjects available for this faculty.</span>
                      )}
                    </div>
                    
                    <button type="submit" className={styles.submitBtn} disabled={submitting || !selectedFacultyId || !selectedSubjectId}>
                      {submitting ? "Assigning..." : "Assign Subject"}
                    </button>
                  </form>
                )}

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
