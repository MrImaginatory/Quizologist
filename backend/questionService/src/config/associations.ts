import Question from "../modules/question/question.model";
import Topic from "../modules/topic/topic.model";
import Subject from "../modules/subject/subject.model";
import Course from "../modules/course/course.model";

Question.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });
Question.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Question.belongsTo(Course, { foreignKey: "course_id", as: "course" });

Topic.hasMany(Question, { foreignKey: "topic_id", as: "questions" });
