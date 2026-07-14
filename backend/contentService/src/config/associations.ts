import Course from "../modules/course/course.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";

Course.hasMany(Subject, { foreignKey: "course_id", as: "subjects" });
Subject.belongsTo(Course, { foreignKey: "course_id", as: "course" });

Subject.hasMany(Topic, { foreignKey: "subject_id", as: "topics" });
Topic.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
