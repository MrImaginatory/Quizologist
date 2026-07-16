import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Topic extends Model {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare subject_id: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Topic.init(
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
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subjects",
        key: "id",
      },
    },
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
