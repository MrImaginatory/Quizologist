import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Course extends Model {
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
