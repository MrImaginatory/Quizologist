import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { QuestionAttributes, QuestionType, DifficultyLevel } from "../../types";

type QuestionCreationAttributes = Optional<
  QuestionAttributes,
  | "id"
  | "choices"
  | "explanation"
  | "videoUrl"
  | "difficulty"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

class Question
  extends Model<QuestionAttributes, QuestionCreationAttributes>
  implements QuestionAttributes
{
  declare id: string;
  declare type: QuestionType;
  declare question: string;
  declare choices: string[] | null;
  declare correctAnswer: string;
  declare explanation: string | null;
  declare videoUrl: string | null;
  declare difficulty: DifficultyLevel;
  declare topic_id: string;
  declare subject_id: string;
  declare faculty_id: string;
  declare questionAddedBy: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("mcq", "descriptive"),
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    choices: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.ENUM("beginner", "normal", "mid", "hard", "expert"),
      allowNull: false,
      defaultValue: "normal",
    },
    topic_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "topics",
        key: "id",
      },
    },
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subjects",
        key: "id",
      },
    },
    faculty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "faculties",
        key: "id",
      },
    },
    questionAddedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "questions",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Question",
    indexes: [
      {
        unique: true,
        fields: ["question", "topic_id"],
        where: {
          deleted_at: null,
        },
      },
    ],
  }
);

export default Question;
