import path from "path";
import fs from "fs";
import { QueryTypes } from "sequelize";
import { connectDatabase, sequelize } from "../config/database";
import "../config/associations";
import Question from "../modules/question/question.model";
import Faculty from "../modules/faculty/faculty.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";

interface QuestionData {
  type: string;
  question: string;
  choices?: string[];
  correctAnswer: string;
  explanation?: string;
  videoUrl?: string;
  difficulty: string;
  topic_id: string;
  subject_id: string;
  faculty_id: string;
}

async function importQuestions() {
  console.log("Starting question import...\n");

  await connectDatabase();

  const jsonPath = path.join(__dirname, "../../../../Data/Questions.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const questions: QuestionData[] = JSON.parse(rawData);

  console.log(`Loaded ${questions.length} questions from JSON\n`);

  // Build lookup maps
  const faculties = await Faculty.findAll();
  const subjects = await Subject.findAll();
  const topics = await Topic.findAll();

  const facultyMap = new Map<string, string>();
  faculties.forEach((f) => facultyMap.set(f.name.toLowerCase(), f.id));

  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => subjectMap.set(s.name.toLowerCase(), s.id));

  const topicMap = new Map<string, string>();
  topics.forEach((t) => topicMap.set(t.name.toLowerCase(), t.id));

  // Fetch teacher assignments via raw SQL
  const teacherAssignments = await sequelize.query(
    `SELECT teacher_id, faculty_id, subject_id FROM teacher_assignments WHERE deleted_at IS NULL`,
    { type: QueryTypes.SELECT }
  ) as any[];

  // Build teacher lookup: faculty_id + subject_id -> teacher_id
  const teacherLookup = new Map<string, string>();
  const facultyTeacherMap = new Map<string, string>();

  teacherAssignments.forEach((ta: any) => {
    const key = `${ta.faculty_id}|${ta.subject_id}`;
    if (!teacherLookup.has(key)) {
      teacherLookup.set(key, ta.teacher_id);
    }

    if (ta.subject_id === null && !facultyTeacherMap.has(ta.faculty_id)) {
      facultyTeacherMap.set(ta.faculty_id, ta.teacher_id);
    }
  });

  let created = 0;
  let skipped = 0;
  let warnings: string[] = [];

  for (const q of questions) {
    const facultyId = facultyMap.get(q.faculty_id.toLowerCase());
    const subjectId = subjectMap.get(q.subject_id.toLowerCase());
    const topicId = topicMap.get(q.topic_id.toLowerCase());

    if (!facultyId) {
      warnings.push(`Faculty "${q.faculty_id}" not found`);
      skipped++;
      continue;
    }

    if (!subjectId) {
      warnings.push(`Subject "${q.subject_id}" not found`);
      skipped++;
      continue;
    }

    if (!topicId) {
      warnings.push(`Topic "${q.topic_id}" not found`);
      skipped++;
      continue;
    }

    // Find teacher for this faculty+subject
    let teacherId: string | null = null;
    const exactKey = `${facultyId}|${subjectId}`;

    if (teacherLookup.has(exactKey)) {
      teacherId = teacherLookup.get(exactKey)!;
    } else if (facultyTeacherMap.has(facultyId)) {
      teacherId = facultyTeacherMap.get(facultyId)!;
    }

    // Check for duplicate
    const existing = await Question.findOne({
      where: { question: q.question, topic_id: topicId },
    });

    if (existing) {
      skipped++;
      continue;
    }

    try {
      await Question.create({
        type: q.type as "mcq" | "descriptive",
        question: q.question,
        choices: q.choices || null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        videoUrl: q.videoUrl || null,
        difficulty: (q.difficulty as any) || "normal",
        topic_id: topicId,
        subject_id: subjectId,
        faculty_id: facultyId,
        questionAddedBy: teacherId,
      });
      created++;
    } catch (err: any) {
      warnings.push(`Error: ${err.message}`);
      skipped++;
    }
  }

  console.log("\n--- Import Summary ---");
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);

  if (warnings.length > 0) {
    const uniqueWarnings = [...new Set(warnings)];
    console.log(`\nWarnings (${uniqueWarnings.length} unique):`);
    uniqueWarnings.slice(0, 20).forEach((w) => console.log(`  - ${w}`));
    if (uniqueWarnings.length > 20) {
      console.log(`  ... and ${uniqueWarnings.length - 20} more`);
    }
  }

  console.log("\nImport completed!");
  process.exit(0);
}

importQuestions().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
