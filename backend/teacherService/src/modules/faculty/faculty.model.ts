import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Faculty extends Model {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Faculty.init(
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
    tableName: "faculties",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Faculty",
  }
);

export default Faculty;
