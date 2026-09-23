import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { UserAttributes, UserRole } from "../../types";
import { sanitizeText, sanitizeIdentifier } from "../../utils/sanitize";

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "location_id" | "createdAt" | "updatedAt" | "deletedAt"
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare id: string;
  declare fname: string;
  declare lname: string;
  declare role: UserRole;
  declare email: string;
  declare mobileNumber: string;
  declare password: string;
  declare location_id: string | null;
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
        // MED-04: strip markup/control chars before persisting
        this.setDataValue("fname", sanitizeText(value).toLowerCase());
      },
    },
    lname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      set(value: string) {
        this.setDataValue("lname", sanitizeText(value).toLowerCase());
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "student", "teacher"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue("email", sanitizeIdentifier(value));
      },
    },
    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      set(value: string) {
        this.setDataValue("mobileNumber", sanitizeIdentifier(value));
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "locations",
        key: "id",
      },
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
