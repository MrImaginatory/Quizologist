import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

export function exportTestResultToPDF(result: TestResult, user: UserData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Student: ${getUserName(user)}`, margin, footerY);
    doc.text(`Test ID: ${result.test_id}`, pageWidth / 2, footerY, { align: "center" });
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
  };

  const checkNewPage = (requiredHeight: number) => {
    if (yPos + requiredHeight > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Test Result Report", margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Test ID: ${result.test_id}`, margin, yPos);
  yPos += 6;
  doc.text(`Date: ${new Date(result.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, yPos);
  yPos += 6;
  doc.text(`Student: ${getUserName(user)}`, margin, yPos);
  yPos += 10;

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryData = [
    [`Total Questions`, result.totalQuestions.toString()],
    [`Attempted`, result.attempted.toString()],
    [`Correct`, result.correct.toString()],
    [`Incorrect`, result.incorrect.toString()],
    [`Skipped`, result.skipped.toString()],
    [`Score`, `${result.score.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: "plain",
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Questions", margin, yPos);
  yPos += 8;

  result.questions.forEach((q, index) => {
    checkNewPage(60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    const questionLabel = `Q${index + 1}. `;
    const questionText = doc.splitTextToSize(q.question, contentWidth - 10);
    doc.text(questionLabel, margin, yPos);
    doc.text(questionText, margin + 12, yPos);
    yPos += questionText.length * 5 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const choiceLetters = ["A", "B", "C", "D", "E"];
    q.choices.forEach((choice, ci) => {
      if (yPos > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPos = 20;
      }
      const letter = choiceLetters[ci] || `${ci + 1}`;
      let prefix = `   ${letter}) `;
      let textColor: [number, number, number] = [60, 60, 60];

      if (choice === q.correctAnswer) {
        textColor = [0, 128, 0];
        prefix = `   ${letter}) [Correct] `;
      }
      if (choice === q.selectedAnswer && choice !== q.correctAnswer) {
        textColor = [200, 0, 0];
        prefix = `   ${letter}) [Your Answer] `;
      }

      doc.setTextColor(...textColor);
      const choiceLines = doc.splitTextToSize(choice, contentWidth - 20);
      doc.text(prefix + choiceLines[0], margin, yPos);
      if (choiceLines.length > 1) {
        yPos += 4;
        choiceLines.slice(1).forEach((line: string) => {
          doc.text(`       ${line}`, margin, yPos);
          yPos += 4;
        });
      }
      yPos += 4;
    });

    yPos += 2;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    const meta: string[] = [];
    if (q.courseName) meta.push(`Course: ${q.courseName}`);
    if (q.subjectName) meta.push(`Subject: ${q.subjectName}`);
    if (q.topicName) meta.push(`Topic: ${q.topicName}`);
    if (q.timeTaken) meta.push(`Time: ${q.timeTaken}s`);

    if (meta.length > 0) {
      checkNewPage(12);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text(meta.join("  |  "), margin, yPos);
      yPos += 5;
    }

    if (q.explanation) {
      checkNewPage(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Explanation: ", margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const explLines = doc.splitTextToSize(q.explanation, contentWidth - 15);
      doc.text(explLines, margin + 2, yPos + 5);
      yPos += explLines.length * 4 + 8;
    }

    yPos += 3;

    if (index < result.questions.length - 1) {
      checkNewPage(5);
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    }
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  doc.save(`test-result-${result.test_id}.pdf`);
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
