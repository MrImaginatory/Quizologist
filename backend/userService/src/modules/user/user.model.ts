import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { UserAttributes, UserRole } from "../../types";

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare fname: string;
  declare lname: string;
  declare role: UserRole;
  declare email: string;
  declare mobilenumber: string;
  declare password: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value: string) {
        this.setDataValue("fname", value.toLowerCase());
      },
    },
    lname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value: string) {
        this.setDataValue("lname", value.toLowerCase());
      },
    },
    role: {
      type: DataTypes.ENUM("student", "teacher"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    mobilenumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      set(value: string) {
        this.setDataValue("mobilenumber", value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: "User",
    indexes: [
      {
        unique: true,
        fields: ["email"],
        where: {
          deleted_at: null,
        },
      },
    ],
  }
);

export default User;
