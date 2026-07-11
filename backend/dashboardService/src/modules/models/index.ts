import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

// ============ Test Session ============
class TestSession extends Model {
  declare id: string;
  declare test_id: string;
  declare student_id: string;
  declare status: string;
  declare total_questions: number;
  declare attempted: number;
  declare skipped: number;
  declare correct: number;
  declare incorrect: number;
  declare score: number;
  declare started_at: Date;
  declare completed_at: Date | null;
  declare created_at: Date;
}

TestSession.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    test_id: { type: DataTypes.STRING(100) },
    student_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING },
    total_questions: { type: DataTypes.INTEGER },
    attempted: { type: DataTypes.INTEGER },
    skipped: { type: DataTypes.INTEGER },
    correct: { type: DataTypes.INTEGER },
    incorrect: { type: DataTypes.INTEGER },
    score: { type: DataTypes.DECIMAL(5, 2) },
    started_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE },
  },
  { sequelize, tableName: "test_sessions", timestamps: false, paranoid: false }
);

// ============ Test Answer ============
class TestAnswer extends Model {
  declare id: string;
  declare test_session_id: string;
  declare question_id: string;
  declare selected_answer: string | null;
  declare is_correct: boolean | null;
  declare time_taken: number;
  declare is_skipped: boolean;
}

TestAnswer.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    test_session_id: { type: DataTypes.UUID },
    question_id: { type: DataTypes.UUID },
    selected_answer: { type: DataTypes.TEXT },
    is_correct: { type: DataTypes.BOOLEAN },
    time_taken: { type: DataTypes.INTEGER },
    is_skipped: { type: DataTypes.BOOLEAN },
  },
  { sequelize, tableName: "test_answers", timestamps: false, paranoid: false }
);

// ============ Question ============
class Question extends Model {
  declare id: string;
  declare topic_id: string;
  declare subject_id: string;
  declare faculty_id: string;
  declare difficulty: string;
}

Question.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    topic_id: { type: DataTypes.UUID },
    subject_id: { type: DataTypes.UUID },
    faculty_id: { type: DataTypes.UUID },
    difficulty: { type: DataTypes.STRING },
  },
  { sequelize, tableName: "questions", timestamps: false, paranoid: false }
);

// ============ Topic ============
class Topic extends Model {
  declare id: string;
  declare name: string;
  declare subject_id: string;
}

Topic.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(100) },
    subject_id: { type: DataTypes.UUID },
  },
  { sequelize, tableName: "topics", timestamps: false, paranoid: false }
);

// ============ Subject ============
class Subject extends Model {
  declare id: string;
  declare name: string;
  declare faculty_id: string;
}

Subject.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(100) },
    faculty_id: { type: DataTypes.UUID },
  },
  { sequelize, tableName: "subjects", timestamps: false, paranoid: false }
);

// ============ Faculty ============
class Faculty extends Model {
  declare id: string;
  declare name: string;
}

Faculty.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(100) },
  },
  { sequelize, tableName: "faculties", timestamps: false, paranoid: false }
);

// ============ Associations ============
TestAnswer.belongsTo(TestSession, { foreignKey: "test_session_id" });
TestAnswer.belongsTo(Question, { foreignKey: "question_id" });

TestSession.hasMany(TestAnswer, { foreignKey: "test_session_id" });

Question.belongsTo(Topic, { foreignKey: "topic_id" });
Question.belongsTo(Subject, { foreignKey: "subject_id" });
Question.belongsTo(Faculty, { foreignKey: "faculty_id" });

Topic.belongsTo(Subject, { foreignKey: "subject_id" });
Subject.belongsTo(Faculty, { foreignKey: "faculty_id" });

export { TestSession, TestAnswer, Question, Topic, Subject, Faculty };
