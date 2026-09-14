import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class TeacherAssignment extends Model {
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
  }
);

export default TeacherAssignment;
