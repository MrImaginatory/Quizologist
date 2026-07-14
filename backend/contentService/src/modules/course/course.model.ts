import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { CourseAttributes } from "../../types";

type CourseCreationAttributes = Optional<
  CourseAttributes,
  "id" | "description" | "createdAt" | "updatedAt" | "deletedAt"
>;

class Course
  extends Model<CourseAttributes, CourseCreationAttributes>
  implements CourseAttributes
{
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue("name", value.toLowerCase());
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "courses",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Course",
  }
);

export default Course;
