import { Op } from "sequelize";
import ExcelJS from "exceljs";
import { ApiError } from "../../utils/ApiError";
import Question from "./question.model";
import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import TeacherAssignment from "../teacherAssignment/teacherAssignment.model";

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
  difficulty?: string;
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
  static async generateTemplate(user?: { userId: string; role: string }): Promise<Buffer> {
    let courseIds: string[] | null = null;
    let subjectIds: string[] | null = null;

    // If teacher, only include assigned courses/subjects
    if (user && user.role === "teacher") {
      const assignments = await TeacherAssignment.findAll({
        where: { teacher_id: user.userId },
        attributes: ["course_id", "subject_id"],
        raw: true,
      });

      if (assignments.length === 0) {
        throw ApiError.badRequest("You are not assigned to any courses or subjects");
      }

      courseIds = [...new Set(assignments.map((a) => a.course_id))];
      subjectIds = assignments
        .filter((a) => a.subject_id !== null)
        .map((a) => a.subject_id as string);
    }

    // Build where conditions for courses
    const courseWhere: any = {};
    if (courseIds) {
      courseWhere.id = { [Op.in]: courseIds };
    }

    // Build where conditions for subjects
    const subjectWhere: any = {};
    if (courseIds) {
      subjectWhere.course_id = { [Op.in]: courseIds };
    }
    if (subjectIds && subjectIds.length > 0) {
      subjectWhere.id = { [Op.in]: subjectIds };
    }

    const courses = await Course.findAll({ where: courseWhere, attributes: ["id", "name"] });
    const subjects = await Subject.findAll({ where: subjectWhere, attributes: ["id", "name", "course_id"] });

    // Build topic where conditions
    const topicWhere: any = {};
    if (subjectIds && subjectIds.length > 0) {
      topicWhere.subject_id = { [Op.in]: subjectIds };
    } else if (courseIds) {
      // If teacher has course-level assignments (no specific subjects), include all topics for those courses
      const courseSubjectIds = subjects.map((s) => s.id);
      if (courseSubjectIds.length > 0) {
        topicWhere.subject_id = { [Op.in]: courseSubjectIds };
      }
    }

    const topics = await Topic.findAll({ where: topicWhere, attributes: ["id", "name", "subject_id"] });

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

    // Sheet 1: Reference — all course/subject/topic names
    const refSheet = workbook.addWorksheet("Reference", {
      properties: { defaultColWidth: 25 },
    });

    const refHeaders = ["Course Name", "Subject Name", "Topic Name"];
    const refHeaderRow = refSheet.addRow(refHeaders);
    refHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    refHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2E75B6" },
    };
    refHeaderRow.alignment = { horizontal: "center" };

    for (const course of courses) {
      const courseSubjects = subjectByCourse.get(course.id) || [];
      for (const subjectName of courseSubjects) {
        const subject = subjects.find(
          (s) => s.name === subjectName && s.course_id === course.id
        );
        if (!subject) continue;

        const subjectTopics = topicBySubject.get(subject.id) || [];
        if (subjectTopics.length === 0) {
          refSheet.addRow([course.name, subjectName, ""]);
        } else {
          for (const topicName of subjectTopics) {
            refSheet.addRow([course.name, subjectName, topicName]);
          }
        }
      }
    }

    // Sheet 2: Questions — import format with 2 empty sample rows
    const qSheet = workbook.addWorksheet("Questions", {
      properties: { defaultColWidth: 22 },
    });

    const qHeaderRow = qSheet.addRow(TEMPLATE_HEADERS);
    qHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    qHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    qHeaderRow.alignment = { horizontal: "center" };

    qSheet.columns.forEach((col) => {
      col.width = 22;
    });

    // Add 2 empty sample rows so user sees the format
    qSheet.addRow(["", "", "", "", "", "", "", "", "", "", "", "", ""]);
    qSheet.addRow(["", "", "", "", "", "", "", "", "", "", "", "", ""]);

    // Comment on Correct Answer header
    const headerCell = qSheet.getCell("J1");
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
    defaultUserId: string,
    user?: { userId: string; role: string }
  ): Promise<BulkImportResult> {
    const BATCH_SIZE = 500;
    const errors: { row: number; reason: string }[] = [];
    let imported = 0;

    // 1. Teacher authorization check (once)
    let allowedPairs: Set<string> | null = null;
    if (user && user.role === "teacher") {
      const assignments = await TeacherAssignment.findAll({
        where: { teacher_id: user.userId },
        attributes: ["course_id", "subject_id"],
        raw: true,
      });

      allowedPairs = new Set(
        assignments.map((a) => `${a.course_id}|${a.subject_id || ""}`)
      );
    }

    // 2. Pre-validate all rows (fast, no DB writes)
    const validRows: { index: number; data: any; dedupeKey: string }[] = [];
    for (let i = 0; i < questions.length; i++) {
      const row = i + 2;
      const q = questions[i];

      if (allowedPairs) {
        const pairKey = `${q.course_id}|${q.subject_id || ""}`;
        if (!allowedPairs.has(pairKey)) {
          errors.push({ row, reason: "You are not assigned to this course/subject combination" });
          continue;
        }
      }

      const validChoices = q.choices.filter((c) => c && c.trim() !== "");
      if (validChoices.length < 2) {
        errors.push({ row, reason: "At least 2 valid options are required" });
        continue;
      }

      if (!validChoices.includes(q.correctAnswer)) {
        errors.push({ row, reason: "Correct answer does not match any provided option" });
        continue;
      }

      validRows.push({
        index: i,
        data: {
          type: "mcq",
          question: q.question,
          choices: validChoices,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          videoUrl: q.videoUrl || null,
          difficulty: q.difficulty || "normal",
          topic_id: q.topic_id,
          subject_id: q.subject_id,
          course_id: q.course_id,
          questionAddedBy: q.questionAddedBy || defaultUserId,
        },
        dedupeKey: `${q.question.toLowerCase()}|${q.topic_id}`,
      });
    }

    // 3. Batch duplicate check using DB (only for topic_ids in this batch)
    const batchTopicIds = [...new Set(validRows.map((r) => r.data.topic_id))];
    const existingQuestions = await Question.findAll({
      where: {
        topic_id: { [Op.in]: batchTopicIds },
        deletedAt: null,
      },
      attributes: ["question", "topic_id"],
    });
    const existingSet = new Set(
      existingQuestions.map((q) => `${q.question.toLowerCase()}|${q.topic_id}`)
    );

    // 4. Process in batches using Sequelize bulkCreate
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      const batchRecords: any[] = [];
      const batchErrors: { row: number; reason: string }[] = [];

      for (const item of batch) {
        const row = item.index + 2;
        if (existingSet.has(item.dedupeKey)) {
          batchErrors.push({ row, reason: "A question with this text already exists for this topic" });
          continue;
        }
        batchRecords.push(item.data);
        existingSet.add(item.dedupeKey);
      }

      if (batchRecords.length > 0) {
        try {
          const result = await Question.bulkCreate(batchRecords, {
            validate: true,
            returning: false,
          });
          imported += result.length;
        } catch (err: any) {
          // Fallback to individual inserts to get per-row errors
          for (const record of batchRecords) {
            try {
              await Question.create(record);
              imported++;
            } catch (innerErr: any) {
              const originalIndex = validRows.findIndex(
                (r) => r.data.question === record.question && r.data.topic_id === record.topic_id
              );
              batchErrors.push({
                row: originalIndex >= 0 ? originalIndex + 2 : i + 2,
                reason: innerErr.message || "Failed to create question",
              });
            }
          }
        }
      }

      errors.push(...batchErrors);
    }

    return {
      totalRows: questions.length,
      imported,
      failed: errors.length,
      errors,
    };
  }
}
