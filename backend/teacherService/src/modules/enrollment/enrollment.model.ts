import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Enrollment extends Model {
  declare id: string;
  declare student_id: string;
  declare course_id: string;
  declare subject_id: string | null;
  declare topic_id: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    tableName: "enrollments",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Enrollment",
  }
);

export default Enrollment;
