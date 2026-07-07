import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Faculty extends Model {
  declare id: string;
  declare name: string;
}

Faculty.init(
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
    tableName: "faculties",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Faculty",
  }
);

export default Faculty;
