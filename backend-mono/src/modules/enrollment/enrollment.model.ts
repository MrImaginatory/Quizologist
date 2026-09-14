import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface EnrollmentAttributes {
  id: string;
  student_id: string;
  course_id: string;
  subject_id: string | null;
  topic_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type EnrollmentCreationAttributes = Optional<
  EnrollmentAttributes,
  "id" | "subject_id" | "topic_id" | "createdAt" | "updatedAt" | "deletedAt"
>;

class Enrollment
  extends Model<EnrollmentAttributes, EnrollmentCreationAttributes>
  implements EnrollmentAttributes
{
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
    indexes: [
      {
        unique: true,
        fields: ["student_id", "course_id", "subject_id", "topic_id"],
        where: {
          deleted_at: null,
        },
      },
    ],
  }
);

export default Enrollment;
