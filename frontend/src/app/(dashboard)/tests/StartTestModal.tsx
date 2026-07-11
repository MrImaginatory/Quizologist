"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./StartTestModal.module.css";
import { studentService, Enrollment } from "@/lib/studentService";
import { testService } from "@/lib/testService";
import { contentService } from "@/lib/contentService";
import MultiSelect from "@/components/common/MultiSelect/MultiSelect";

const DURATION_LIMITS = [
  { time: 15, min: 15, max: 30 },
  { time: 20, min: 20, max: 40 },
  { time: 25, min: 25, max: 50 },
  { time: 30, min: 30, max: 60 },
  { time: 40, min: 30, max: 80 },
  { time: 45, min: 40, max: 120 },
];

interface StartTestModalProps {
  onClose: () => void;
  onSuccess: (testData: any) => void;
}

export default function StartTestModal({ onClose, onSuccess }: StartTestModalProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [extraTopics, setExtraTopics] = useState<Map<string, any[]>>(new Map());
  
  // Selection sets
  const [selectedFaculties, setSelectedFaculties] = useState<Set<string>>(new Set());
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  
  const [duration, setDuration] = useState<number>(30);
  const [questionCount, setQuestionCount] = useState<number>(30);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const limits = DURATION_LIMITS.find(l => l.time === duration) || DURATION_LIMITS[3];

  useEffect(() => {
    loadEnrollments();
  }, []);

  useEffect(() => {
    if (questionCount < limits.min) setQuestionCount(limits.min);
    if (questionCount > limits.max) setQuestionCount(limits.max);
  }, [duration, limits, questionCount]);

  // Helper to safely get IDs
  const getFId = (env: Enrollment) => env.faculty_id || env.faculty?.id || "";
  const getSId = (env: Enrollment) => env.subject_id || env.subject?.id || "";
  const getTId = (env: Enrollment) => env.topic_id || env.topic?.id || "";

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const res = await studentService.getMyEnrollments(1, 100);
      if (res.success && res.data) {
        const envs = res.data.enrollments || [];
        setEnrollments(envs);

        // Fetch topics for subjects that have "All Topics"
        const subjectsNeedingTopics = new Set<string>();
        envs.forEach((env: Enrollment) => {
          const sId = getSId(env);
          const tId = getTId(env);
          if (sId && !tId) {
            subjectsNeedingTopics.add(sId);
          }
        });

        const newExtraTopics = new Map<string, any[]>();
        for (const sId of Array.from(subjectsNeedingTopics)) {
          try {
            const topicRes = await contentService.getTopicsBySubject(sId, 1, 100);
            // topicRes data format: { topics: [...] }
            const topics = topicRes.data?.topics || (topicRes.data as any) || [];
            newExtraTopics.set(sId, Array.isArray(topics) ? topics : []);
          } catch (err) {
            console.error("Failed to fetch topics for subject", sId, err);
          }
        }
        setExtraTopics(newExtraTopics);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Derive available options based on enrollments and selections
  const facultyOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    enrollments.forEach(env => {
      const fId = getFId(env);
      if (env.faculty && fId && !map.has(fId)) {
        map.set(fId, { id: fId, name: env.faculty.name });
      }
    });
    return Array.from(map.values());
  }, [enrollments]);

  const subjectOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; facultyId: string; group?: string }>();
    enrollments.forEach(env => {
      const fId = getFId(env);
      const sId = getSId(env);
      if (selectedFaculties.size > 0 && !selectedFaculties.has(fId)) return;
      if (env.subject && sId && !map.has(sId)) {
        map.set(sId, { 
          id: sId, 
          name: env.subject.name, 
          facultyId: fId,
          group: env.faculty?.name || "Other"
        });
      }
    });
    return Array.from(map.values());
  }, [enrollments, selectedFaculties]);

  const topicOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; subjectId: string; group?: string }>();
    
    // We need to map subject names to ensure we can group extra topics properly
    const subjectNameMap = new Map<string, string>();
    enrollments.forEach(env => {
      const sId = getSId(env);
      if (env.subject && sId) subjectNameMap.set(sId, env.subject.name);
    });

    enrollments.forEach(env => {
      const fId = getFId(env);
      const sId = getSId(env);
      const tId = getTId(env);
      
      if (selectedFaculties.size > 0 && !selectedFaculties.has(fId)) return;
      if (selectedSubjects.size > 0 && (!sId || !selectedSubjects.has(sId))) return;
      
      const groupName = env.subject?.name || subjectNameMap.get(sId) || "Other";

      // Explicit topics
      if (env.topic && tId && !map.has(tId)) {
        map.set(tId, { 
          id: tId, 
          name: env.topic.name, 
          subjectId: sId,
          group: groupName
        });
      }

      // Extra topics for "All Topics" enrollments
      if (sId && !tId) {
        const topics = extraTopics.get(sId);
        if (topics) {
          topics.forEach((t: any) => {
            if (!map.has(t.id)) {
              map.set(t.id, { 
                id: t.id, 
                name: t.name, 
                subjectId: sId,
                group: groupName
              });
            }
          });
        }
      }
    });
    return Array.from(map.values());
  }, [enrollments, selectedFaculties, selectedSubjects, extraTopics]);

  // Handle cascading clears
  const handleFacultyChange = (newFaculties: Set<string>) => {
    setSelectedFaculties(newFaculties);
    // Remove subjects that do not belong to the newly selected faculties
    const validSubjects = new Set<string>();
    subjectOptions.forEach(opt => {
      if (newFaculties.has(opt.facultyId) && selectedSubjects.has(opt.id)) {
        validSubjects.add(opt.id);
      }
    });
    setSelectedSubjects(validSubjects);
    
    // Remove topics that do not belong to the valid subjects
    const validTopics = new Set<string>();
    topicOptions.forEach(opt => {
      if (validSubjects.has(opt.subjectId) && selectedTopics.has(opt.id)) {
        validTopics.add(opt.id);
      }
    });
    setSelectedTopics(validTopics);
  };

  const handleSubjectChange = (newSubjects: Set<string>) => {
    setSelectedSubjects(newSubjects);
    // Remove topics that do not belong to the newly selected subjects
    const validTopics = new Set<string>();
    topicOptions.forEach(opt => {
      if (newSubjects.has(opt.subjectId) && selectedTopics.has(opt.id)) {
        validTopics.add(opt.id);
      }
    });
    setSelectedTopics(validTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFaculties.size === 0) {
      setError("Please select at least one faculty.");
      return;
    }

    if (questionCount < limits.min || questionCount > limits.max) {
      setError(`For ${duration} minutes, questions must be between ${limits.min} and ${limits.max}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const selections: any[] = [];
      
      // Build selections directly from the selected Sets and the relationship stored in options
      selectedFaculties.forEach(fId => {
        // Find subjects belonging to this faculty that are selected
        const subsForFaculty = subjectOptions.filter(s => s.facultyId === fId && selectedSubjects.has(s.id));
        
        if (subsForFaculty.length === 0) {
          // If no specific subject selected for this faculty, add a faculty-wide selection
          selections.push({ faculty_id: fId });
        } else {
          subsForFaculty.forEach(s => {
            // Find topics belonging to this subject that are selected
            const topicsForSubject = topicOptions.filter(t => t.subjectId === s.id && selectedTopics.has(t.id));
            
            if (topicsForSubject.length === 0) {
              selections.push({ faculty_id: fId, subject_id: s.id });
            } else {
              topicsForSubject.forEach(t => {
                selections.push({ faculty_id: fId, subject_id: s.id, topic_id: t.id });
              });
            }
          });
        }
      });

      const payload = {
        duration_minutes: duration,
        question_limit: questionCount,
        selections
      };

      const res = await testService.startTest(payload);
      
      if (res.success) {
        onSuccess(res.data);
      } else {
        setError(res.message || "Failed to start test");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while starting the test");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Start New Test</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={submitting}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Duration</label>
                <select
                  className={styles.select}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={submitting}
                >
                  {DURATION_LIMITS.map(limit => (
                    <option key={limit.time} value={limit.time}>
                      {limit.time} Minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Number of Questions</label>
                <input
                  type="number"
                  className={styles.input}
                  min={limits.min}
                  max={limits.max}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={submitting}
                />
                <span className={styles.helpText}>
                  Min: {limits.min}, Max: {limits.max}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div>Loading enrollments...</div>
          ) : (
            <>
              <MultiSelect
                label="Faculties *"
                options={facultyOptions}
                selectedIds={selectedFaculties}
                onChange={handleFacultyChange}
                disabled={submitting || facultyOptions.length === 0}
                placeholder="Select faculties..."
              />

              <MultiSelect
                label="Subjects (Optional)"
                options={subjectOptions}
                selectedIds={selectedSubjects}
                onChange={handleSubjectChange}
                disabled={submitting || selectedFaculties.size === 0 || subjectOptions.length === 0}
                placeholder={selectedFaculties.size === 0 ? "Select faculty first..." : "Select subjects..."}
              />

              <MultiSelect
                label="Topics (Optional)"
                options={topicOptions}
                selectedIds={selectedTopics}
                onChange={setSelectedTopics}
                disabled={submitting || selectedSubjects.size === 0 || topicOptions.length === 0}
                placeholder={selectedSubjects.size === 0 ? "Select subject first..." : "Select topics..."}
              />
            </>
          )}
        </form>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button 
            type="button" 
            className={styles.submitBtn} 
            onClick={handleSubmit} 
            disabled={submitting || selectedFaculties.size === 0}
          >
            {submitting ? "Starting..." : "Start Test"}
            {!submitting && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
