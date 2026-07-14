import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Subject extends Model {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare course_id: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

Subject.init(
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
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },
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
