import ExcelJS from "exceljs";
import { ApiError } from "../../utils/ApiError";
import Question from "./question.model";
import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";

const TEMPLATE_HEADERS = [
  "Course Name",
  "Subject Name",
  "Topic Name",
  "Question",
  "Option 1",
  "Option 2",
  "Option 3",
  "Option 4",
  "Option 5",
  "Correct Answer",
  "Explanation",
  "Video URL",
  "Question Added By",
];

export interface BulkQuestionInput {
  type: "mcq";
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation?: string;
  videoUrl?: string;
  topic_id: string;
  subject_id: string;
  course_id: string;
  questionAddedBy?: string;
}

export interface BulkImportResult {
  totalRows: number;
  imported: number;
  failed: number;
  errors: { row: number; reason: string }[];
}

export class QuestionImportService {
  static async generateTemplate(): Promise<Buffer> {
    const courses = await Course.findAll({ attributes: ["id", "name"] });
    const subjects = await Subject.findAll({ attributes: ["id", "name", "course_id"] });
    const topics = await Topic.findAll({ attributes: ["id", "name", "subject_id"] });

    const subjectByCourse = new Map<string, string[]>();
    for (const s of subjects) {
      const list = subjectByCourse.get(s.course_id) || [];
      list.push(s.name);
      subjectByCourse.set(s.course_id, list);
    }

    const topicBySubject = new Map<string, string[]>();
    for (const t of topics) {
      const list = topicBySubject.get(t.subject_id) || [];
      list.push(t.name);
      topicBySubject.set(t.subject_id, list);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "QuizNew Admin";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Questions", {
      properties: { defaultColWidth: 20 },
    });

    // Header row styling
    const headerRow = sheet.addRow(TEMPLATE_HEADERS);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = { horizontal: "center" };

    // Set column widths
    sheet.columns.forEach((col) => {
      col.width = 22;
    });

    // Pre-fill first 3 rows with sample data showing valid combinations
    let exampleCount = 0;
    for (const course of courses) {
      const courseSubjects = subjectByCourse.get(course.id) || [];
      for (const subjectName of courseSubjects) {
        const subject = subjects.find(
          (s) => s.name === subjectName && s.course_id === course.id
        );
        if (!subject) continue;

        const subjectTopics = topicBySubject.get(subject.id) || [];
        for (const topicName of subjectTopics) {
          if (exampleCount >= 3) break;
          sheet.addRow([course.name, subjectName, topicName]);
          exampleCount++;
        }
        if (exampleCount >= 3) break;
      }
      if (exampleCount >= 3) break;
    }

    // Add a comment to Correct Answer header explaining valid values
    const headerCell = sheet.getCell("J1");
    headerCell.note = {
      texts: [
        { font: { bold: true, size: 11 }, text: "Must match one of: Option 1, Option 2, Option 3, Option 4, Option 5\n" },
        { font: { size: 11 }, text: "Enter the exact text of one of the options above." },
      ],
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  static async bulkCreate(
    questions: BulkQuestionInput[],
    defaultUserId: string
  ): Promise<BulkImportResult> {
    const errors: { row: number; reason: string }[] = [];
    let imported = 0;

    // Pre-fetch all existing questions for duplicate check
    const existingQuestions = await Question.findAll({
      attributes: ["question", "topic_id"],
      where: { deletedAt: null },
    });
    const existingSet = new Set(
      existingQuestions.map((q) => `${q.question.toLowerCase()}|${q.topic_id}`)
    );

    for (let i = 0; i < questions.length; i++) {
      const row = i + 2; // Excel rows are 1-indexed, header is row 1
      const q = questions[i];

      // Validate choices count
      const validChoices = q.choices.filter((c) => c && c.trim() !== "");
      if (validChoices.length < 2) {
        errors.push({ row, reason: "At least 2 valid options are required" });
        continue;
      }

      // Validate correct answer matches one of the choices
      if (!validChoices.includes(q.correctAnswer)) {
        errors.push({
          row,
          reason: "Correct answer does not match any provided option",
        });
        continue;
      }

      // Check for duplicate question within the same topic
      const dedupeKey = `${q.question.toLowerCase()}|${q.topic_id}`;
      if (existingSet.has(dedupeKey)) {
        errors.push({
          row,
          reason: "A question with this text already exists for this topic",
        });
        continue;
      }

      // Insert the question
      try {
        await Question.create({
          type: "mcq",
          question: q.question,
          choices: validChoices,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          videoUrl: q.videoUrl || null,
          difficulty: "normal",
          topic_id: q.topic_id,
          subject_id: q.subject_id,
          course_id: q.course_id,
          questionAddedBy: q.questionAddedBy || defaultUserId,
        });

        // Add to set so duplicates within the same batch are caught
        existingSet.add(dedupeKey);
        imported++;
      } catch (err: any) {
        errors.push({ row, reason: err.message || "Failed to create question" });
      }
    }

    return {
      totalRows: questions.length,
      imported,
      failed: errors.length,
      errors,
    };
  }
}
