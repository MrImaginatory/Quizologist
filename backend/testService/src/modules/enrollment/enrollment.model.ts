import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Enrollment extends Model {
  declare id: string;
  declare student_id: string;
  declare faculty_id: string;
  declare subject_id: string | null;
  declare topic_id: string | null;
}

Enrollment.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    student_id: { type: DataTypes.UUID },
    faculty_id: { type: DataTypes.UUID },
    subject_id: { type: DataTypes.UUID, allowNull: true },
    topic_id: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    tableName: "enrollments",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Enrollment",
  }
);

export default Enrollment;
