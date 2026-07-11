"use client";

import { useState, useEffect } from "react";
import styles from "./Questions.module.css";
import { contentService, Faculty, Subject, Topic } from "@/lib/contentService";
import { questionService, Question, QuestionType, Difficulty } from "@/lib/questionService";
import { capitalize } from "@/utils/helpers";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import DataTable from "@/components/common/DataTable/DataTable";
import Pagination from "@/components/common/Pagination/Pagination";

export default function QuestionsPage() {
  // Filter state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as string | null });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<QuestionType>("mcq");
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState<string[]>(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [videoUrl, setVideoUrl] = useState("");

  // 1. Fetch faculties on mount
  useEffect(() => {
    const init = async () => {
      try {
        const res = await contentService.getFaculties(1, 100);
        if (res.success && res.data) {
          setFaculties(res.data.faculties as Faculty[] || []);
        }
      } catch (err) {
        console.error("Error fetching faculties:", err);
      }
    };
    init();
  }, []);

  // 2. Fetch subjects when faculty changes
  useEffect(() => {
    setSelectedSubject("");
    setSelectedTopic("");
    setSubjects([]);
    setTopics([]);
    setQuestions([]);
    
    if (!selectedFaculty) return;

    const fetchSubjects = async () => {
      try {
        const res = await contentService.getSubjectsByFaculty(selectedFaculty, 1, 100);
        if (res.success && res.data) {
          setSubjects(res.data.subjects as Subject[] || []);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, [selectedFaculty]);

  // 3. Fetch topics when subject changes
  useEffect(() => {
    setSelectedTopic("");
    setTopics([]);
    setQuestions([]);

    if (!selectedSubject) return;

    const fetchTopics = async () => {
      try {
        const res = await contentService.getTopicsBySubject(selectedSubject, 1, 100);
        if (res.success && res.data) {
          setTopics(res.data.topics as Topic[] || []);
        }
      } catch (err) {
        console.error("Error fetching topics:", err);
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  // 4. Manual fetch questions
  const handleShowQuestions = async (currentPage = 1) => {
    try {
      setLoading(true);
      const res = await questionService.filterQuestions({
        faculty_id: selectedFaculty || undefined,
        subject_id: selectedSubject || undefined,
        topic_id: selectedTopic || undefined,
        page: currentPage,
        limit
      });
      if (res.success && res.data) {
        setQuestions(res.data.questions || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we already have questions loaded and just changing page
    // But initially, do nothing until "Show Questions" is clicked
    if (questions.length > 0 || page > 1) {
      handleShowQuestions(page);
    }
  }, [page]);

  // Handle choice updates
  const handleChoiceChange = (index: number, val: string) => {
    const newChoices = [...choices];
    newChoices[index] = val;
    setChoices(newChoices);
  };

  const handleAddChoice = () => {
    if (choices.length < 5) {
      setChoices([...choices, ""]);
    }
  };

  const handleRemoveChoice = (index: number) => {
    if (choices.length > 2) {
      const newChoices = [...choices];
      newChoices.splice(index, 1);
      setChoices(newChoices);
    }
  };

  const handleOpenModal = (q?: Question) => {
    if (q) {
      setEditingId(q.id);
      setType(q.type);
      setQuestionText(q.question);
      setChoices(q.choices || ["", ""]);
      setCorrectAnswer(q.correctAnswer);
      setExplanation(q.explanation || "");
      setDifficulty(q.difficulty);
      setVideoUrl(q.videoUrl || "");
    } else {
      setEditingId(null);
      setType("mcq");
      setQuestionText("");
      setChoices(["", ""]);
      setCorrectAnswer("");
      setExplanation("");
      setDifficulty("normal");
      setVideoUrl("");
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await questionService.deleteQuestion(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
      handleShowQuestions(page);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : (error as { message?: string })?.message || "Error deleting question";
      alert(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !selectedSubject || !selectedFaculty) {
      alert("Please select a Faculty, Subject, and Topic first");
      return;
    }
    
    if (type === "mcq" && !choices.includes(correctAnswer)) {
      alert("Correct answer must match one of the choices perfectly");
      return;
    }

    try {
      setSubmitting(true);
      const payload: Omit<Question, "id" | "questionAddedBy" | "createdAt" | "updatedAt" | "deletedAt"> = {
        type,
        question: questionText,
        correctAnswer,
        explanation,
        videoUrl,
        difficulty,
        topic_id: selectedTopic,
        subject_id: selectedSubject,
        faculty_id: selectedFaculty
      };

      if (type === "mcq") {
        payload.choices = choices;
      }

      if (editingId) {
        await questionService.updateQuestion(editingId, payload);
      } else {
        await questionService.createQuestion(payload);
      }
      
      setIsModalOpen(false);
      if (!editingId) setPage(1);
      handleShowQuestions(editingId ? page : 1);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : (error as { message?: string })?.message || "Error saving question";
      console.error("Error saving question:", error);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyClass = (diff: string) => {
    switch (diff) {
      case "beginner": return styles.badgeDiffBeginner;
      case "normal": return styles.badgeDiffNormal;
      case "mid": return styles.badgeDiffMid;
      case "hard": return styles.badgeDiffHard;
      case "expert": return styles.badgeDiffExpert;
      default: return styles.badgeDiffNormal;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Questions</h1>
          <p>Manage questions grouped by topic</p>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.addButton} 
            onClick={() => handleOpenModal()}
            disabled={!selectedTopic}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Question
          </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label>Faculty</label>
          <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
            <option value="">Select Faculty...</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{capitalize(f.name)}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Subject</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedFaculty}>
            <option value="">Select Subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{capitalize(s.name)}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Topic</label>
          <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} disabled={!selectedSubject}>
            <option value="">Select Topic...</option>
            {topics.map(t => <option key={t.id} value={t.id}>{capitalize(t.name)}</option>)}
          </select>
        </div>
        
        <button 
          className={styles.showBtn} 
          onClick={() => { setPage(1); handleShowQuestions(1); }}
          style={{ marginLeft: 'auto' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Show Questions
        </button>
      </div>

      <DataTable
        columns={["Type", "Question", "Difficulty", "Actions"]}
        loading={loading}
        loadingMessage="Loading questions..."
        isEmpty={questions.length === 0}
        emptyMessage="Click 'Show Questions' to load data or adjust filters."
      >
        {questions.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeType}`}>
                        {q.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.descriptionCell} title={q.question}>{q.question}</td>
                    <td>
                      <span className={`${styles.badge} ${getDifficultyClass(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className={styles.editBtn} onClick={() => handleOpenModal(q)}>
                          <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                          <span className={styles.btnText}>Edit</span>
                        </button>
                        <button className={styles.deleteBtn} onClick={() => confirmDelete(q.id)}>
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
              <h2>{editingId ? "Edit Question" : "Add New Question"}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Question Type *</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as QuestionType)} 
                    disabled={!!editingId} // Usually can't change type after creation safely
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="descriptive">Descriptive</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Difficulty *</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)} 
                  >
                    <option value="beginner">Beginner</option>
                    <option value="normal">Normal</option>
                    <option value="mid">Mid</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Question Text *</label>
                <textarea 
                  value={questionText} 
                  onChange={(e) => setQuestionText(e.target.value)} 
                  required 
                  placeholder="Enter the question..."
                  rows={3}
                />
              </div>

              {type === "mcq" && (
                <div className={styles.formGroup}>
                  <label>Choices (2-5)</label>
                  {choices.map((choice, i) => (
                    <div key={i} className={styles.choiceRow}>
                      <input 
                        type="text" 
                        value={choice} 
                        onChange={(e) => handleChoiceChange(i, e.target.value)}
                        placeholder={`Choice ${i + 1}`}
                        required
                      />
                      {choices.length > 2 && (
                        <button 
                          type="button" 
                          className={styles.removeChoiceBtn}
                          onClick={() => handleRemoveChoice(i)}
                          title="Remove choice"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {choices.length < 5 && (
                    <button 
                      type="button" 
                      className={styles.addChoiceBtn}
                      onClick={handleAddChoice}
                    >
                      + Add another choice
                    </button>
                  )}
                </div>
              )}

              <div className={styles.formGroup}>
                <label>{type === "mcq" ? "Exact Correct Answer *" : "Correct Answer / Keywords *"}</label>
                <input 
                  type="text" 
                  value={correctAnswer} 
                  onChange={(e) => setCorrectAnswer(e.target.value)} 
                  required 
                  placeholder={type === "mcq" ? "Must exactly match one of the choices above" : "Enter the expected answer"}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Explanation (Optional)</label>
                <textarea 
                  value={explanation} 
                  onChange={(e) => setExplanation(e.target.value)} 
                  placeholder="Why is this answer correct?"
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Video URL (Optional)</label>
                <input 
                  type="url" 
                  value={videoUrl} 
                  onChange={(e) => setVideoUrl(e.target.value)} 
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={submitting || !questionText.trim()}>
                  {submitting ? "Saving..." : (editingId ? "Update Question" : "Save Question")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
