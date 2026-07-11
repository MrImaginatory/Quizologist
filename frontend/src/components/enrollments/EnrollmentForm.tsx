"use client";

import React, { useState, useEffect } from "react";
import styles from "./EnrollmentForm.module.css";
import { contentService, Faculty, Subject, Topic } from "@/lib/contentService";
import { capitalize } from "@/utils/helpers";

interface EnrollmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  onEnroll: (enrollments: { faculty_id: string; subject_id?: string; topic_id?: string }[]) => Promise<any>;
}

export default function EnrollmentForm({ onClose, onSuccess, onEnroll }: EnrollmentFormProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFaculties();
  }, []);

  useEffect(() => {
    setSelectedSubject("");
    setSelectedTopic("");
    setSubjects([]);
    setTopics([]);
    if (selectedFaculty) {
      loadSubjects(selectedFaculty);
    }
  }, [selectedFaculty]);

  useEffect(() => {
    setSelectedTopic("");
    setTopics([]);
    if (selectedSubject) {
      loadTopics(selectedSubject);
    }
  }, [selectedSubject]);

  const loadFaculties = async () => {
    try {
      setLoading(true);
      const res = await contentService.getFaculties(1, 100);
      if (res.success && Array.isArray(res.data.faculties)) {
        setFaculties(res.data.faculties);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load faculties");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async (facultyId: string) => {
    try {
      const res = await contentService.getSubjectsByFaculty(facultyId, 1, 100);
      if (res.success && Array.isArray(res.data.subjects)) {
        setSubjects(res.data.subjects);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      const res = await contentService.getTopicsBySubject(subjectId, 1, 100);
      if (res.success && Array.isArray(res.data.topics)) {
        setTopics(res.data.topics);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) {
      setError("Please select a faculty");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const payload = {
        faculty_id: selectedFaculty,
        ...(selectedSubject ? { subject_id: selectedSubject } : {}),
        ...(selectedTopic ? { topic_id: selectedTopic } : {}),
      };

      const res = await onEnroll([payload]);
      
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || "Failed to enroll");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>New Enrollment</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={submitting}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Faculty *</label>
            <select
              className={styles.select}
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              disabled={loading || submitting}
              required
            >
              <option value="">Select a faculty...</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {capitalize(f.name)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Subject (Optional)</label>
            <select
              className={styles.select}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedFaculty || submitting}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {capitalize(s.name)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Topic (Optional)</label>
            <select
              className={styles.select}
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject || submitting}
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {capitalize(t.name)}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={!selectedFaculty || submitting}>
            {submitting ? "Enrolling..." : "Enroll"}
          </button>
        </div>
      </div>
    </div>
  );
}
