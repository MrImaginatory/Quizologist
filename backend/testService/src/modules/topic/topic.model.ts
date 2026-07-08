import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Topic extends Model {
  declare id: string;
  declare name: string;
  declare subject_id: string;
}

Topic.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(100) },
    subject_id: { type: DataTypes.UUID },
  },
  {
    sequelize,
    tableName: "topics",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Topic",
  }
);

export default Topic;
