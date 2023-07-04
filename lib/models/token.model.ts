// The 'mongoose' module is used for defining and interacting with database models. It provides a high-level API for working with MongoDB.

// The 'tokenSchema' defines the structure and validation rules for the 'Token' model. It has fields such as 'token', 'user', 'type', 'expires', and 'blacklisted', with their respective data types and required flags.

// The 'tokenSchema' also includes a 'timestamps' option, which automatically adds 'createdAt' and 'updatedAt' fields to each document, representing the creation and last update times.

// The 'Token' model is defined using the 'mongoose.model' function, which takes the model name ("Token") and the 'tokenSchema' as parameters. It checks if the model already exists and uses it if available, or creates a new one if not.

// The 'tokenSchema.plugin(toJSON)' line is commented out. The plugin that converts mongoose models to JSON format.

import mongoose from "mongoose"; // Importing the 'mongoose' module for interacting with the database
import { tokenTypes } from "@/lib/config/tokens"; // Importing the 'tokenTypes' constant from '@/lib/config/tokens' for token type enumeration
import { toJSON } from "./plugins/toJSON.plugin"; // Importing the 'toJSON' plugin for converting mongoose models to JSON

const { Schema } = mongoose;

// Defining the schema for the 'Token' model
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

// add plugin that converts mongoose to json
// tokenSchema.plugin(toJSON);

/**
 * @typedef Token
 * https://stackoverflow.com/a/43761258
 */

// The 'Token' model is exported so that it can be used in other parts of the application. It represents the token documents in the database and provides methods for interacting with them.
export const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);
