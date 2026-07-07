import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Subject extends Model {
  declare id: string;
  declare name: string;
  declare faculty_id: string;
}

Subject.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(100) },
    faculty_id: { type: DataTypes.UUID },
  },
  {
    sequelize,
    tableName: "subjects",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Subject",
  }
);

export default Subject;
