import path from "path";
import fs from "fs";
import { connectDatabase } from "../config/database";
import "../config/associations";
import Faculty from "../modules/faculty/faculty.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";

interface TopicData {
  subject_name: string;
  topics: string[];
}

interface FacultyData {
  faculty: string;
  subjects: TopicData[];
}

async function importData() {
  console.log("Starting faculty data import...\n");

  await connectDatabase();

  const jsonPath = path.join(__dirname, "../../../../Data/FacultyData.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const faculties: FacultyData[] = JSON.parse(rawData);

  let totalFaculties = 0;
  let totalSubjects = 0;
  let totalTopics = 0;
  let skippedFaculties = 0;
  let skippedSubjects = 0;
  let skippedTopics = 0;

  for (const facultyData of faculties) {
    const facultyName = facultyData.faculty.toLowerCase().trim();

    let faculty = await Faculty.findOne({ where: { name: facultyName } });

    if (faculty) {
      skippedFaculties++;
      console.log(`[SKIP] Faculty "${facultyData.faculty}" already exists`);
    } else {
      faculty = await Faculty.create({ name: facultyName });
      totalFaculties++;
      console.log(`[CREATED] Faculty "${facultyData.faculty}"`);
    }

    for (const subjectData of facultyData.subjects) {
      const subjectName = subjectData.subject_name.toLowerCase().trim();

      let subject = await Subject.findOne({
        where: { name: subjectName, faculty_id: faculty.id },
      });

      if (subject) {
        skippedSubjects++;
        console.log(`  [SKIP] Subject "${subjectData.subject_name}" already exists`);
      } else {
        subject = await Subject.create({
          name: subjectName,
          faculty_id: faculty.id,
        });
        totalSubjects++;
        console.log(`  [CREATED] Subject "${subjectData.subject_name}"`);
      }

      for (const topicName of subjectData.topics) {
        const normalizedTopic = topicName.toLowerCase().trim();

        const existingTopic = await Topic.findOne({
          where: { name: normalizedTopic, subject_id: subject.id },
        });

        if (existingTopic) {
          skippedTopics++;
        } else {
          await Topic.create({
            name: normalizedTopic,
            subject_id: subject.id,
          });
          totalTopics++;
        }
      }
    }
  }

  console.log("\n--- Import Summary ---");
  console.log(`Faculties: ${totalFaculties} created, ${skippedFaculties} skipped`);
  console.log(`Subjects:  ${totalSubjects} created, ${skippedSubjects} skipped`);
  console.log(`Topics:    ${totalTopics} created, ${skippedTopics} skipped`);
  console.log("Import completed successfully!");

  process.exit(0);
}

importData().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
