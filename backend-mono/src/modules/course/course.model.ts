import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Course extends Model {
  declare id: string;
  declare name: string;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
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
