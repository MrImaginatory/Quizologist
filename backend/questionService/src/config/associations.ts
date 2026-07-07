import Question from "../modules/question/question.model";
import Topic from "../modules/topic/topic.model";
import Subject from "../modules/subject/subject.model";
import Faculty from "../modules/faculty/faculty.model";

Question.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });
Question.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Question.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });

Topic.hasMany(Question, { foreignKey: "topic_id", as: "questions" });
