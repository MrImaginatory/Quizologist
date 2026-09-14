import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Course extends Model {
  declare id: string;
  declare name: string;
  declare description: string | null;
}

Course.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT, allowNull: true },
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
