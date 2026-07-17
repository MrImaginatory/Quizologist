import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

type TestStatus = "draft" | "active" | "inactive" | "archived";
type DifficultyLevel = "beginner" | "normal" | "mid" | "hard" | "expert" | "mixed";

interface PredefinedTestAttributes {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  status: TestStatus;
  is_scheduled: boolean;
  start_time: Date | null;
  end_time: Date | null;
  timezone: string;
  duration_minutes: number;
  question_limit: number;
  difficulty: DifficultyLevel;
  use_fixed_questions: boolean;
  max_attempts: number;
  course_ids: string[];
  subject_ids: string[] | null;
  topic_ids: string[] | null;
  test_link_token: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type PredefinedTestCreationAttributes = Optional<
  PredefinedTestAttributes,
  | "id"
  | "description"
  | "status"
  | "is_scheduled"
  | "start_time"
  | "end_time"
  | "timezone"
  | "difficulty"
  | "use_fixed_questions"
  | "max_attempts"
  | "subject_ids"
  | "topic_ids"
  | "test_link_token"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

class PredefinedTest
  extends Model<PredefinedTestAttributes, PredefinedTestCreationAttributes>
  implements PredefinedTestAttributes
{
  declare id: string;
  declare title: string;
  declare description: string | null;
  declare created_by: string;
  declare status: TestStatus;
  declare is_scheduled: boolean;
  declare start_time: Date | null;
  declare end_time: Date | null;
  declare timezone: string;
  declare duration_minutes: number;
  declare question_limit: number;
  declare difficulty: DifficultyLevel;
  declare use_fixed_questions: boolean;
  declare max_attempts: number;
  declare course_ids: string[];
  declare subject_ids: string[] | null;
  declare topic_ids: string[] | null;
  declare test_link_token: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

PredefinedTest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "inactive", "archived"),
      allowNull: false,
      defaultValue: "draft",
    },
    is_scheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "UTC",
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM("beginner", "normal", "mid", "hard", "expert", "mixed"),
      allowNull: false,
      defaultValue: "normal",
    },
    use_fixed_questions: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    course_ids: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    subject_ids: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    topic_ids: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    test_link_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "predefined_tests",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "PredefinedTest",
  }
);

export default PredefinedTest;
