import Teacher from "../modules/teacher/teacher.model";
import Course from "../modules/course/course.model";
import Subject from "../modules/subject/subject.model";
import TeacherAssignment from "../modules/teacherAssignment/teacherAssignment.model";

TeacherAssignment.belongsTo(Teacher, { foreignKey: "teacher_id", as: "teacher" });
TeacherAssignment.belongsTo(Course, { foreignKey: "course_id", as: "course" });
TeacherAssignment.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

Teacher.hasMany(TeacherAssignment, { foreignKey: "teacher_id", as: "assignments" });
Course.hasMany(TeacherAssignment, { foreignKey: "course_id", as: "teacherAssignments" });
Subject.hasMany(TeacherAssignment, { foreignKey: "subject_id", as: "teacherAssignments" });
