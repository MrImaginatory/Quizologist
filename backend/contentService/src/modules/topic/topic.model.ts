import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { TopicAttributes } from "../../types";

type TopicCreationAttributes = Optional<
  TopicAttributes,
  "id" | "description" | "createdAt" | "updatedAt" | "deletedAt"
>;

class Topic
  extends Model<TopicAttributes, TopicCreationAttributes>
  implements TopicAttributes
{
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
      set(value: string) {
        this.setDataValue("name", value.toLowerCase());
      },
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
