import * as XLSX from "xlsx";
import type { TestResult } from "./api";

interface UserData {
  fname?: string;
  lname?: string;
  email?: string;
}

function getUserName(user: UserData): string {
  const fname = user.fname || "";
  const lname = user.lname || "";
  return `${fname} ${lname}`.trim() || "Unknown User";
}

export function exportTestResultToExcel(result: TestResult, user: UserData) {
  const summaryData = [
    ["Test Result Summary"],
    [],
    ["Test ID", result.test_id],
    ["Date", new Date(result.completedAt).toLocaleDateString()],
    ["Student", getUserName(user)],
    ["Total Questions", result.totalQuestions],
    ["Attempted", result.attempted],
    ["Correct", result.correct],
    ["Incorrect", result.incorrect],
    ["Skipped", result.skipped],
    ["Score", `${result.score.toFixed(1)}%`],
    [],
    ["Question Details"],
    [],
  ];

  const questionHeaders = ["#", "Question", "Your Answer", "Correct Answer", "Status", "Course", "Subject", "Topic", "Time (s)"];
  const questionData = result.questions.map((q, i) => [
    i + 1,
    q.question,
    q.selectedAnswer || "Skipped",
    q.correctAnswer,
    q.isCorrect ? "Correct" : "Incorrect",
    q.courseName,
    q.subjectName,
    q.topicName,
    q.timeTaken,
  ]);

  const explanationHeaders = ["#", "Question", "Explanation"];
  const explanationData = result.questions
    .filter((q) => q.explanation)
    .map((q, i) => [i + 1, q.question, q.explanation]);

  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  const wsQuestions = XLSX.utils.aoa_to_sheet([questionHeaders, ...questionData]);
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions");

  if (explanationData.length > 0) {
    const wsExplanations = XLSX.utils.aoa_to_sheet([explanationHeaders, ...explanationData]);
    XLSX.utils.book_append_sheet(wb, wsExplanations, "Explanations");
  }

  XLSX.writeFile(wb, `test-result-${result.test_id}.xlsx`);
}
