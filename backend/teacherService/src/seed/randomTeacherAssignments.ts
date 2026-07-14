import { connectDatabase } from "../config/database";
import "../config/associations";
import Teacher from "../modules/teacher/teacher.model";
import Course from "../modules/course/course.model";
import Subject from "../modules/subject/subject.model";
import TeacherAssignment from "../modules/teacherAssignment/teacherAssignment.model";

function getRandomItems<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.min(Math.floor(Math.random() * (max - min + 1)) + min, arr.length);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function seedTeacherAssignments() {
  console.log("Starting random teacher assignment seeding...\n");

  await connectDatabase();

  const teachers = await Teacher.findAll({ where: { role: "teacher" } });
  const courses = await Course.findAll();
  const subjects = await Subject.findAll();

  console.log(`Found: ${teachers.length} teachers, ${courses.length} courses, ${subjects.length} subjects\n`);

  if (teachers.length === 0) {
    console.log("No teachers found. Please add teachers first.");
    process.exit(0);
  }

  if (courses.length === 0) {
    console.log("No courses found. Please run the content seed first.");
    process.exit(0);
  }

  let totalAssignments = 0;
  let skippedAssignments = 0;

  for (const teacher of teachers) {
    const numCourses = Math.min(
      Math.floor(Math.random() * 2) + 1,
      courses.length
    );
    const selectedCourses = getRandomItems(courses, 1, numCourses);

    for (const course of selectedCourses) {
      const existingCourse = await TeacherAssignment.findOne({
        where: {
          teacher_id: teacher.id,
          course_id: course.id,
          subject_id: null,
        },
      });

      if (!existingCourse) {
        await TeacherAssignment.create({
          teacher_id: teacher.id,
          course_id: course.id,
        });
        totalAssignments++;
        console.log(`  [CREATED] Course "${course.name}" -> ${teacher.fname} ${teacher.lname}`);
      } else {
        skippedAssignments++;
      }

      const courseSubjects = subjects.filter((s) => s.course_id === course.id);

      if (courseSubjects.length > 0) {
        const numSubjects = Math.min(
          Math.floor(Math.random() * 4) + 1,
          courseSubjects.length
        );
        const selectedSubjects = getRandomItems(courseSubjects, 1, numSubjects);

        for (const subject of selectedSubjects) {
          const existingSubject = await TeacherAssignment.findOne({
            where: {
              teacher_id: teacher.id,
              course_id: course.id,
              subject_id: subject.id,
            },
          });

          if (!existingSubject) {
            await TeacherAssignment.create({
              teacher_id: teacher.id,
              course_id: course.id,
              subject_id: subject.id,
            });
            totalAssignments++;
            console.log(`    [CREATED] Subject "${subject.name}" -> ${teacher.fname} ${teacher.lname}`);
          } else {
            skippedAssignments++;
          }
        }
      }
    }

    console.log(`Processed teacher: ${teacher.fname} ${teacher.lname}`);
  }

  console.log("\n--- Seeding Summary ---");
  console.log(`Assignments created: ${totalAssignments}`);
  console.log(`Assignments skipped (duplicates): ${skippedAssignments}`);
  console.log("Seeding completed!");

  process.exit(0);
}

seedTeacherAssignments().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
