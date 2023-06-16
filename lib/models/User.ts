import { Schema, model, models } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: String,
    lastname: String,
    email: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.encryptPassword = async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
};

userSchema.statics.comparePassword = async function (password: string, hash: string) {
  return await bcrypt.compare(password, hash);
};


userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
      delete ret.hash;
  }
});


export default models.User || model("User", userSchema);