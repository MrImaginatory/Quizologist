import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { TestStatus } from "../../types";

interface TestSessionAttributes {
  id: string;
  test_id: string;
  student_id: string;
  status: TestStatus;
  predefined_test_id: string | null;
  subject_id: string | null;
  topic_id: string | null;
  duration_minutes: number;
  question_limit: number;
  ends_at: Date | null;
  total_questions: number;
  attempted: number;
  skipped: number;
  correct: number;
  incorrect: number;
  score: number;
  disconnect_count: number;
  last_question_index: number;
  started_at: Date;
  completed_at: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type TestSessionCreationAttributes = Optional<
  TestSessionAttributes,
  | "id"
  | "predefined_test_id"
  | "subject_id"
  | "topic_id"
  | "ends_at"
  | "attempted"
  | "skipped"
  | "correct"
  | "incorrect"
  | "score"
  | "disconnect_count"
  | "last_question_index"
  | "completed_at"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

class TestSession
  extends Model<TestSessionAttributes, TestSessionCreationAttributes>
  implements TestSessionAttributes
{
  declare id: string;
  declare test_id: string;
  declare student_id: string;
  declare status: TestStatus;
  declare predefined_test_id: string | null;
  declare subject_id: string | null;
  declare topic_id: string | null;
  declare duration_minutes: number;
  declare question_limit: number;
  declare ends_at: Date | null;
  declare total_questions: number;
  declare attempted: number;
  declare skipped: number;
  declare correct: number;
  declare incorrect: number;
  declare score: number;
  declare disconnect_count: number;
  declare last_question_index: number;
  declare started_at: Date;
  declare completed_at: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

TestSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    test_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed", "abandoned"),
      allowNull: false,
      defaultValue: "pending",
    },
    predefined_test_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "predefined_tests",
        key: "id",
      },
    },
    subject_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    topic_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    question_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_questions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attempted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    skipped: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    correct: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    incorrect: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    disconnect_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_question_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "test_sessions",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "TestSession",
  }
);

export default TestSession;
