var mongoose = require("mongoose");
var _ = require("lodash");

export interface UserInterface {
  email: string;
  name: string;
  phone: string;
  role: string;
  description: string;
  extra?: string;
  createdAt: Date;
  photo: string;
}
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  extra: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  photo: {
    type: String,
    required: true,
  },
});

UserSchema.statics.fieldsForJSON = ["id", "name", "email", "createdAt", "phone", "role", "photo"];

// Class methods
UserSchema.methods.forJSON = function () {
  return _.pick(this, this.constructor.fieldsForJSON);
};

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
