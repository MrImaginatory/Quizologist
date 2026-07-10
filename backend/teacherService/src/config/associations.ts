import Teacher from "../modules/teacher/teacher.model";
import Faculty from "../modules/faculty/faculty.model";
import Subject from "../modules/subject/subject.model";
import TeacherAssignment from "../modules/teacherAssignment/teacherAssignment.model";

TeacherAssignment.belongsTo(Teacher, { foreignKey: "teacher_id", as: "teacher" });
TeacherAssignment.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });
TeacherAssignment.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

Teacher.hasMany(TeacherAssignment, { foreignKey: "teacher_id", as: "assignments" });
Faculty.hasMany(TeacherAssignment, { foreignKey: "faculty_id", as: "teacherAssignments" });
Subject.hasMany(TeacherAssignment, { foreignKey: "subject_id", as: "teacherAssignments" });
