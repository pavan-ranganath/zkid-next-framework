import mongoose from "mongoose";
import { tokenTypes } from "@/lib/config/tokens";
import { toJSON } from "./plugins/toJSON.plugin";

const { Schema } = mongoose;

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "credentials",
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.VERIFY_EMAIL],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// // add plugin that converts mongoose to json
// tokenSchema.plugin(toJSON);

/**
 * @typedef Token
 * https://stackoverflow.com/a/43761258
 */
export const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);
