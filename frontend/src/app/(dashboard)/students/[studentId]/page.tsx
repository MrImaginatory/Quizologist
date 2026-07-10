"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./StudentEnrollments.module.css";
import { studentService, Enrollment } from "@/lib/studentService";
import { capitalize } from "@/utils/helpers";

type TopicGroup = {
  id: string;
  name: string;
};

type SubjectGroup = {
  id: string;
  name: string;
  topics: TopicGroup[];
};

type FacultyGroup = {
  id: string;
  name: string;
  subjects: Record<string, SubjectGroup>;
};

export default function StudentEnrollmentsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [studentName, setStudentName] = useState("");
  const [hierarchy, setHierarchy] = useState<Record<string, FacultyGroup>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch student details to get the name
        const studentRes = await studentService.getStudentById(studentId);
        if (studentRes.success && studentRes.data) {
          setStudentName(
            `${capitalize(studentRes.data.fname)} ${capitalize(studentRes.data.lname)}`
          );
        }

        // Fetch enrollments
        const res = await studentService.getStudentEnrollments(studentId, 1, 1000);
        if (res.success && res.data) {
          const enrollments: Enrollment[] = res.data.enrollments || [];
          
          // Build hierarchy
          const tree: Record<string, FacultyGroup> = {};
          
          enrollments.forEach((env) => {
            if (!env.faculty) return;
            
            const facId = env.faculty.id;
            if (!tree[facId]) {
              tree[facId] = {
                id: facId,
                name: env.faculty.name,
                subjects: {},
              };
            }
            
            if (env.subject) {
              const subId = env.subject.id;
              if (!tree[facId].subjects[subId]) {
                tree[facId].subjects[subId] = {
                  id: subId,
                  name: env.subject.name,
                  topics: [],
                };
              }
              
              if (env.topic) {
                // Avoid duplicates if multiple enrollments exist for some reason
                if (!tree[facId].subjects[subId].topics.find(t => t.id === env.topic!.id)) {
                  tree[facId].subjects[subId].topics.push({
                    id: env.topic.id,
                    name: env.topic.name,
                  });
                }
              }
            }
          });
          
          setHierarchy(tree);
        } else {
          setError(res.message || "Failed to load enrollments");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/students")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Students
        </button>
        <div>
          <h1 className={styles.title}>Enrollments</h1>
          <p className={styles.subtitle}>{studentName ? `For ${studentName}` : "Student Details"}</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading student enrollments...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : Object.keys(hierarchy).length === 0 ? (
        <div className={styles.empty}>No enrollments found for this student.</div>
      ) : (
        <div className={styles.hierarchyContainer}>
          {Object.values(hierarchy).map((faculty) => (
            <div key={faculty.id} className={styles.facultySection}>
              <h2 className={styles.facultyName}>
                {capitalize(faculty.name)}
                <span className={styles.badge}>Faculty</span>
              </h2>
              
              {Object.keys(faculty.subjects).length > 0 && (
                <div className={styles.subjectList}>
                  {Object.values(faculty.subjects).map((subject) => (
                    <div key={subject.id} className={styles.subjectItem}>
                      <h3 className={styles.subjectName}>{capitalize(subject.name)}</h3>
                      
                      {subject.topics.length > 0 && (
                        <div className={styles.topicList}>
                          {subject.topics.map((topic) => (
                            <div key={topic.id} className={styles.topicItem}>
                              {capitalize(topic.name)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
