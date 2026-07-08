import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Question extends Model {
  declare id: string;
  declare type: string;
  declare question: string;
  declare choices: string[] | null;
  declare correctAnswer: string;
  declare explanation: string | null;
  declare videoUrl: string | null;
  declare difficulty: string;
  declare topic_id: string;
  declare subject_id: string;
  declare faculty_id: string;
}

Question.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    type: { type: DataTypes.ENUM("mcq", "descriptive") },
    question: { type: DataTypes.TEXT },
    choices: { type: DataTypes.JSONB, allowNull: true },
    correctAnswer: { type: DataTypes.TEXT },
    explanation: { type: DataTypes.TEXT, allowNull: true },
    videoUrl: { type: DataTypes.STRING(500), allowNull: true },
    difficulty: { type: DataTypes.ENUM("beginner", "normal", "mid", "hard", "expert") },
    topic_id: { type: DataTypes.UUID },
    subject_id: { type: DataTypes.UUID },
    faculty_id: { type: DataTypes.UUID },
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
