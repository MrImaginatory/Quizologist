import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface PredefinedTestQuestionAttributes {
  id: string;
  predefined_test_id: string;
  question_id: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type PredefinedTestQuestionCreationAttributes = Optional<
  PredefinedTestQuestionAttributes,
  "id" | "createdAt" | "updatedAt"
>;

class PredefinedTestQuestion
  extends Model<PredefinedTestQuestionAttributes, PredefinedTestQuestionCreationAttributes>
  implements PredefinedTestQuestionAttributes
{
  declare id: string;
  declare predefined_test_id: string;
  declare question_id: string;
  declare order: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PredefinedTestQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    predefined_test_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "predefined_tests",
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
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "predefined_test_questions",
    timestamps: true,
    underscored: true,
    modelName: "PredefinedTestQuestion",
  }
);

export default PredefinedTestQuestion;
