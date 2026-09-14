import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Question extends Model {
  declare id: string;
  declare type: "mcq" | "descriptive";
  declare question: string;
  declare choices: string[] | null;
  declare correctAnswer: string;
  declare explanation: string | null;
  declare videoUrl: string | null;
  declare difficulty: string;
  declare topic_id: string;
  declare subject_id: string;
  declare course_id: string;
  declare questionAddedBy: string | null;
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
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
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
  }
);

export default Question;
