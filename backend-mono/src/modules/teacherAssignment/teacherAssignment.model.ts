import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface TeacherAssignmentAttributes {
  id: string;
  teacher_id: string;
  course_id: string;
  subject_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type TeacherAssignmentCreationAttributes = Optional<
  TeacherAssignmentAttributes,
  "id" | "subject_id" | "createdAt" | "updatedAt" | "deletedAt"
>;

class TeacherAssignment
  extends Model<TeacherAssignmentAttributes, TeacherAssignmentCreationAttributes>
  implements TeacherAssignmentAttributes
{
  declare id: string;
  declare teacher_id: string;
  declare course_id: string;
  declare subject_id: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

TeacherAssignment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
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
  },
  {
    sequelize,
    tableName: "teacher_assignments",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "TeacherAssignment",
    indexes: [
      {
        unique: true,
        fields: ["teacher_id", "course_id", "subject_id"],
        where: {
          deleted_at: null,
        },
      },
    ],
  }
);

export default TeacherAssignment;
