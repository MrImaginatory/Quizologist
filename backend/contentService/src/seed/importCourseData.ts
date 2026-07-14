import path from "path";
import fs from "fs";
import { connectDatabase } from "../config/database";
import "../config/associations";
import Course from "../modules/course/course.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";

interface TopicData {
  subject_name: string;
  topics: string[];
}

interface CourseData {
  course: string;
  subjects: TopicData[];
}

async function importData() {
  console.log("Starting course data import...\n");

  await connectDatabase();

  const jsonPath = path.join(__dirname, "../../../../Data/CourseData.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const cleanedData = rawData.replace(/^\uFEFF/, '');
  const courses: CourseData[] = JSON.parse(cleanedData);

  let totalCourses = 0;
  let totalSubjects = 0;
  let totalTopics = 0;
  let skippedCourses = 0;
  let skippedSubjects = 0;
  let skippedTopics = 0;

  for (const courseData of courses) {
    const courseName = courseData.course.toLowerCase().trim();

    let course = await Course.findOne({ where: { name: courseName } });

    if (course) {
      skippedCourses++;
      console.log(`[SKIP] Course "${courseData.course}" already exists`);
    } else {
      course = await Course.create({ name: courseName });
      totalCourses++;
      console.log(`[CREATED] Course "${courseData.course}"`);
    }

    for (const subjectData of courseData.subjects) {
      const subjectName = subjectData.subject_name.toLowerCase().trim();

      let subject = await Subject.findOne({
        where: { name: subjectName, course_id: course.id },
      });

      if (subject) {
        skippedSubjects++;
        console.log(`  [SKIP] Subject "${subjectData.subject_name}" already exists`);
      } else {
        subject = await Subject.create({
          name: subjectName,
          course_id: course.id,
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
  console.log(`Courses: ${totalCourses} created, ${skippedCourses} skipped`);
  console.log(`Subjects:  ${totalSubjects} created, ${skippedSubjects} skipped`);
  console.log(`Topics:    ${totalTopics} created, ${skippedTopics} skipped`);
  console.log("Import completed successfully!");

  process.exit(0);
}

importData().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
