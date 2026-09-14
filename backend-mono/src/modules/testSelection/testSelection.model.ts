import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface TestSelectionAttributes {
  id: string;
  test_session_id: string;
  course_id: string;
  subject_id: string | null;
  topic_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type TestSelectionCreationAttributes = Optional<
  TestSelectionAttributes,
  "id" | "subject_id" | "topic_id" | "createdAt" | "updatedAt" | "deletedAt"
>;

class TestSelection
  extends Model<TestSelectionAttributes, TestSelectionCreationAttributes>
  implements TestSelectionAttributes
{
  declare id: string;
  declare test_session_id: string;
  declare course_id: string;
  declare subject_id: string | null;
  declare topic_id: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

TestSelection.init(
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
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },
    subject_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "subjects",
        key: "id",
      },
    },
    topic_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "topics",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "test_selections",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "TestSelection",
  }
);

export default TestSelection;
