import TestSession from "../modules/testSession/testSession.model";
import TestAnswer from "../modules/testAnswer/testAnswer.model";
import Faculty from "../modules/faculty/faculty.model";
import Subject from "../modules/subject/subject.model";
import Topic from "../modules/topic/topic.model";
import Question from "../modules/question/question.model";

TestSession.hasMany(TestAnswer, { foreignKey: "test_session_id", as: "answers" });
TestAnswer.belongsTo(TestSession, { foreignKey: "test_session_id", as: "testSession" });

TestSession.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty", constraints: false });
TestSession.belongsTo(Subject, { foreignKey: "subject_id", as: "subject", constraints: false });
TestSession.belongsTo(Topic, { foreignKey: "topic_id", as: "topic", constraints: false });
