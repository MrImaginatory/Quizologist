import Faculty from "../modules/faculty/faculty.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";

Faculty.hasMany(Subject, { foreignKey: "faculty_id", as: "subjects" });
Subject.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });

Subject.hasMany(Topic, { foreignKey: "subject_id", as: "topics" });
Topic.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
