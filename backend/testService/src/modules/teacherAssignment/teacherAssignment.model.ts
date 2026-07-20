import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class TeacherAssignment extends Model {
  declare id: string;
  declare teacher_id: string;
  declare course_id: string;
  declare subject_id: string | null;
}

TeacherAssignment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    teacher_id: {
      type: DataTypes.UUID,
    },
    course_id: {
      type: DataTypes.UUID,
    },
    subject_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
