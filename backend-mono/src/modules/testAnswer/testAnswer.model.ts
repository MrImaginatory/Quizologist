import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface TestAnswerAttributes {
  id: string;
  test_session_id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean | null;
  time_taken: number;
  is_skipped: boolean;
  submitted_at: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type TestAnswerCreationAttributes = Optional<
  TestAnswerAttributes,
  | "id"
  | "selected_answer"
  | "is_correct"
  | "submitted_at"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

class TestAnswer
  extends Model<TestAnswerAttributes, TestAnswerCreationAttributes>
  implements TestAnswerAttributes
{
  declare id: string;
  declare test_session_id: string;
  declare question_id: string;
  declare selected_answer: string | null;
  declare is_correct: boolean | null;
  declare time_taken: number;
  declare is_skipped: boolean;
  declare submitted_at: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

TestAnswer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    test_session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "test_sessions",
        key: "id",
      },
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    selected_answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    time_taken: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_skipped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "test_answers",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "TestAnswer",
  }
);

export default TestAnswer;
