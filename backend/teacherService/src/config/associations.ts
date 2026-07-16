import Teacher from "../modules/teacher/teacher.model";
import Course from "../modules/course/course.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";
import TeacherAssignment from "../modules/teacherAssignment/teacherAssignment.model";
import Enrollment from "../modules/enrollment/enrollment.model";
import TestSession from "../modules/testSession/testSession.model";
import TestAnswer from "../modules/testAnswer/testAnswer.model";
import Question from "../modules/question/question.model";

TeacherAssignment.belongsTo(Teacher, { foreignKey: "teacher_id", as: "teacher" });
TeacherAssignment.belongsTo(Course, { foreignKey: "course_id", as: "course" });
TeacherAssignment.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

Teacher.hasMany(TeacherAssignment, { foreignKey: "teacher_id", as: "assignments" });
Course.hasMany(TeacherAssignment, { foreignKey: "course_id", as: "teacherAssignments" });
Subject.hasMany(TeacherAssignment, { foreignKey: "subject_id", as: "teacherAssignments" });

Enrollment.belongsTo(Course, { foreignKey: "course_id", as: "course" });
Enrollment.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

TestSession.belongsTo(Enrollment, { foreignKey: "student_id", targetKey: "student_id", as: "enrollment" });

TestAnswer.belongsTo(TestSession, { foreignKey: "test_session_id", as: "testSession" });
TestAnswer.belongsTo(Question, { foreignKey: "question_id", as: "question" });

Question.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });
Question.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Question.belongsTo(Course, { foreignKey: "course_id", as: "course" });

Topic.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Subject.belongsTo(Course, { foreignKey: "course_id", as: "course" });
