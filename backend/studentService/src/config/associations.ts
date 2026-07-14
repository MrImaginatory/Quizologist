import Enrollment from "../modules/enrollment/enrollment.model";
import Course from "../modules/course/course.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";
import Student from "../modules/student/student.model";

Enrollment.belongsTo(Course, { foreignKey: "course_id", as: "course" });
Enrollment.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Enrollment.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });
Enrollment.belongsTo(Student, { foreignKey: "student_id", as: "student" });
Student.hasMany(Enrollment, { foreignKey: "student_id", as: "enrollments" });
