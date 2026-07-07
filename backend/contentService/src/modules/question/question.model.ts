import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

class Question extends Model {
  declare id: string;
  declare topic_id: string;
}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    topic_id: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize,
    tableName: "questions",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "Question",
  }
);

export default Question;
