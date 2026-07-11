import { connectDatabase } from "../config/database";
import "../config/associations";
import Teacher from "../modules/teacher/teacher.model";
import Faculty from "../modules/faculty/faculty.model";
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
  const faculties = await Faculty.findAll();
  const subjects = await Subject.findAll();

  console.log(`Found: ${teachers.length} teachers, ${faculties.length} faculties, ${subjects.length} subjects\n`);

  if (teachers.length === 0) {
    console.log("No teachers found. Please add teachers first.");
    process.exit(0);
  }

  if (faculties.length === 0) {
    console.log("No faculties found. Please run the content seed first.");
    process.exit(0);
  }

  let totalAssignments = 0;
  let skippedAssignments = 0;

  for (const teacher of teachers) {
    const numFaculties = Math.min(
      Math.floor(Math.random() * 2) + 1,
      faculties.length
    );
    const selectedFaculties = getRandomItems(faculties, 1, numFaculties);

    for (const faculty of selectedFaculties) {
      const existingFaculty = await TeacherAssignment.findOne({
        where: {
          teacher_id: teacher.id,
          faculty_id: faculty.id,
          subject_id: null,
        },
      });

      if (!existingFaculty) {
        await TeacherAssignment.create({
          teacher_id: teacher.id,
          faculty_id: faculty.id,
        });
        totalAssignments++;
        console.log(`  [CREATED] Faculty "${faculty.name}" -> ${teacher.fname} ${teacher.lname}`);
      } else {
        skippedAssignments++;
      }

      const facultySubjects = subjects.filter((s) => s.faculty_id === faculty.id);

      if (facultySubjects.length > 0) {
        const numSubjects = Math.min(
          Math.floor(Math.random() * 4) + 1,
          facultySubjects.length
        );
        const selectedSubjects = getRandomItems(facultySubjects, 1, numSubjects);

        for (const subject of selectedSubjects) {
          const existingSubject = await TeacherAssignment.findOne({
            where: {
              teacher_id: teacher.id,
              faculty_id: faculty.id,
              subject_id: subject.id,
            },
          });

          if (!existingSubject) {
            await TeacherAssignment.create({
              teacher_id: teacher.id,
              faculty_id: faculty.id,
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
