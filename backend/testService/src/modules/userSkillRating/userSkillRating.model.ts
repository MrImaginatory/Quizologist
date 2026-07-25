import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface UserSkillRatingAttributes {
  id: string;
  user_id: string;
  skill_score: number;
  total_answers: number;
  correct_answers: number;
  current_streak: number;
  best_streak: number;
  last_answered_at: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserSkillRatingCreationAttributes = Optional<
  UserSkillRatingAttributes,
  | "id"
  | "skill_score"
  | "total_answers"
  | "correct_answers"
  | "current_streak"
  | "best_streak"
  | "last_answered_at"
  | "createdAt"
  | "updatedAt"
>;

class UserSkillRating
  extends Model<UserSkillRatingAttributes, UserSkillRatingCreationAttributes>
  implements UserSkillRatingAttributes
{
  declare id: string;
  declare user_id: string;
  declare skill_score: number;
  declare total_answers: number;
  declare correct_answers: number;
  declare current_streak: number;
  declare best_streak: number;
  declare last_answered_at: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserSkillRating.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    skill_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 3.0,
    },
    total_answers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    correct_answers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    current_streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    best_streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_answered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "user_skill_ratings",
    timestamps: true,
    underscored: true,
    modelName: "UserSkillRating",
  }
);

export default UserSkillRating;
