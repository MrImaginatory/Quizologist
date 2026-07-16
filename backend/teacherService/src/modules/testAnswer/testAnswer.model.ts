import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class TestAnswer extends Model {
  declare id: string;
  declare test_session_id: string;
  declare question_id: string;
  declare selected_answer: string | null;
  declare is_skipped: boolean;
  declare time_taken: number | null;
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
      references: {
        model: "questions",
        key: "id",
      },
    },
    selected_answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_skipped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time_taken: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
