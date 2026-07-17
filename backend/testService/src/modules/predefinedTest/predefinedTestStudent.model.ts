import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

type StudentTestStatus = "assigned" | "started" | "completed";

interface PredefinedTestStudentAttributes {
  id: string;
  predefined_test_id: string;
  student_id: string;
  status: StudentTestStatus;
  test_session_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type PredefinedTestStudentCreationAttributes = Optional<
  PredefinedTestStudentAttributes,
  "id" | "status" | "test_session_id" | "createdAt" | "updatedAt"
>;

class PredefinedTestStudent
  extends Model<PredefinedTestStudentAttributes, PredefinedTestStudentCreationAttributes>
  implements PredefinedTestStudentAttributes
{
  declare id: string;
  declare predefined_test_id: string;
  declare student_id: string;
  declare status: StudentTestStatus;
  declare test_session_id: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PredefinedTestStudent.init(
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
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("assigned", "started", "completed"),
      allowNull: false,
      defaultValue: "assigned",
    },
    test_session_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "test_sessions",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "predefined_test_students",
    timestamps: true,
    underscored: true,
    modelName: "PredefinedTestStudent",
  }
);

export default PredefinedTestStudent;
