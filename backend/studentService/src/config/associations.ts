import Enrollment from "../modules/enrollment/enrollment.model";
import Faculty from "../modules/faculty/faculty.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";
import Student from "../modules/student/student.model";

Enrollment.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });
Enrollment.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Enrollment.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });
Enrollment.belongsTo(Student, { foreignKey: "student_id", as: "student" });
Student.hasMany(Enrollment, { foreignKey: "student_id", as: "enrollments" });
