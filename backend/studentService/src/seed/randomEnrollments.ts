import { connectDatabase } from "../config/database";
import "../config/associations";
import Student from "../modules/student/student.model";
import Enrollment from "../modules/enrollment/enrollment.model";
import Course from "../modules/course/course.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";

function getRandomItems<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function seedEnrollments() {
  console.log("Starting random enrollment seeding...\n");

  await connectDatabase();

  const students = await Student.findAll({ where: { role: "student" } });
  const courses = await Course.findAll();
  const subjects = await Subject.findAll();
  const topics = await Topic.findAll();

  console.log(`Found: ${students.length} students, ${courses.length} courses, ${subjects.length} subjects, ${topics.length} topics\n`);

  if (students.length === 0) {
    console.log("No students found. Please add students first.");
    process.exit(0);
  }

  if (courses.length === 0) {
    console.log("No courses found. Please run the content seed first.");
    process.exit(0);
  }

  let totalEnrollments = 0;
  let skippedEnrollments = 0;

  for (const student of students) {
    const numCourses = Math.min(
      Math.floor(Math.random() * 3) + 1,
      courses.length
    );
    const selectedCourses = getRandomItems(courses, 1, numCourses);

    for (const course of selectedCourses) {
      const courseSubjects = subjects.filter(
        (s) => s.course_id === course.id
      );

      if (courseSubjects.length === 0) {
        const existing = await Enrollment.findOne({
          where: {
            student_id: student.id,
            course_id: course.id,
            subject_id: null,
            topic_id: null,
          },
        });

        if (!existing) {
          await Enrollment.create({
            student_id: student.id,
            course_id: course.id,
          });
          totalEnrollments++;
        } else {
          skippedEnrollments++;
        }
        continue;
      }

      const numSubjects = Math.min(
        Math.floor(Math.random() * 3) + 1,
        courseSubjects.length
      );
      const selectedSubjects = getRandomItems(courseSubjects, 1, numSubjects);

      for (const subject of selectedSubjects) {
        const subjectTopics = topics.filter(
          (t) => t.subject_id === subject.id
        );

        if (subjectTopics.length === 0) {
          const existing = await Enrollment.findOne({
            where: {
              student_id: student.id,
              course_id: course.id,
              subject_id: subject.id,
              topic_id: null,
            },
          });

          if (!existing) {
            await Enrollment.create({
              student_id: student.id,
              course_id: course.id,
              subject_id: subject.id,
            });
            totalEnrollments++;
          } else {
            skippedEnrollments++;
          }
          continue;
        }

        const numTopics = Math.min(
          Math.floor(Math.random() * 4) + 1,
          subjectTopics.length
        );
        const selectedTopics = getRandomItems(subjectTopics, 1, numTopics);

        for (const topic of selectedTopics) {
          const existing = await Enrollment.findOne({
            where: {
              student_id: student.id,
              course_id: course.id,
              subject_id: subject.id,
              topic_id: topic.id,
            },
          });

          if (!existing) {
            await Enrollment.create({
              student_id: student.id,
              course_id: course.id,
              subject_id: subject.id,
              topic_id: topic.id,
            });
            totalEnrollments++;
          } else {
            skippedEnrollments++;
          }
        }
      }
    }

    console.log(`Processed student: ${student.fname} ${student.lname}`);
  }

  console.log("\n--- Seeding Summary ---");
  console.log(`Enrollments created: ${totalEnrollments}`);
  console.log(`Enrollments skipped (duplicates): ${skippedEnrollments}`);
  console.log("Seeding completed!");

  process.exit(0);
}

seedEnrollments().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
