// The `mongoose` library is imported to enable integration with MongoDB.
// It provides an easy-to-use object data modeling (ODM) for managing interactions with the database.
import mongoose from "mongoose";

// The `RegistrationResponseJSON` type is imported from the "@simplewebauthn/typescript-types" module.
// It is used to define the structure of a registration response JSON object related to a web authentication process.
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";

// The `VerifiedRegistrationResponse` type is imported from the "@simplewebauthn/server" module.
// It is used to define the structure of a verified registration response object, which contains information about a successful registration process.
import { VerifiedRegistrationResponse } from "@simplewebauthn/server";

// The `dbConnect` function is imported from a local file named "mongodb.js". Custom function responsible for establishing a connection to the MongoDB database.
import toast from "react-hot-toast";
import { dbConnect } from "./mongodb";

export interface passkeyObj {
  credentialId: string; // The ID of the credential associated with the passkey
  friendlyName: string; // A friendly name or label for the passkey
  credential: RegistrationResponseJSON; // The registration response JSON object representing the passkey credential
  registrationInfo: VerifiedRegistrationResponse; // Information about the verified registration response for the passkey
}
export interface Field<T> {
  value: T;
  verified: boolean;
}
export interface DbCredential {
  _id?: string; // Optional unique identifier for the credential in the database
  userID: string; // The ID of the user associated with the credential
  passkeyInfo: passkeyObj[]; // An array of passkey objects containing information about the user's passkeys
  userInfo?: {
    fullName: Field<string>; // The first name of the user
    email: Field<string>; // The email address of the user
    dob: Field<string>; // The last name of the user
    mobile: Field<string>; // The last name of the user
  };
}

/**
 * saveChallenge saves a challenge value for a user in the database.
 * @param challenge - The challenge value to be saved.
 * @param userID - The ID of the user associated with the challenge.
 */
export async function saveChallenge({ userID, challenge }: { challenge: string; userID: string }) {
  console.log("saveChallenge", challenge, userID);

  // Saving a challenge value in the "challenge" collection of the database for a specific user
  await mongoose.connection.db.collection("challenge").updateOne(
    {
      userID,
    },
    {
      $set: {
        value: challenge,
      },
    },
    {
      upsert: true, // Creating a new document if it doesn't exist
    },
  );
}

/**
 * getChallenge retrieves and removes the challenge value for a user from the database.
 * @param userID - The ID of the user associated with the challenge.
 * @returns The challenge value retrieved from the database.
 */
export async function getChallenge(userID: string) {
  // Retrieving and deleting a challenge value from the "challenge" collection for a specific user
  const challengeObj = await mongoose.connection.db
    .collection<{ userID: string; value: string }>("challenge")
    .findOneAndDelete({
      userID,
    });

  return challengeObj.value; // Returning the challenge value
}

/**
 * saveCredentials stores the user's public key and related information in the database.
 * @param cred The user's credentials object containing public key, user ID, and additional information.
 */
export async function saveCredentials(cred: DbCredential) {
  // Saving the user's credentials in the "credentials" collection of the database
  await mongoose.connection.db.collection<DbCredential>("credentials").insertOne({
    userID: cred.userID, // Storing the user's ID
    passkeyInfo: cred.passkeyInfo, // Storing the user's passkey information (e.g., credential ID, friendly name, etc.)
    userInfo: cred.userInfo, // Storing additional user information (e.g., first name, email, etc.)
  });
}

/**
 * updateCredentials stores the user's public key in the database.
 * @param cred user's public key
 */
export async function updateCredentials(cred: passkeyObj, userID: string) {
  // Updating the user's credentials in the "credentials" collection of the database
  await mongoose.connection.db.collection<DbCredential>("credentials").updateOne(
    {
      userID,
    },
    {
      $push: {
        passkeyInfo: cred,
      },
    },
  );
}
// Function to handle registration errors
export function handleRegistrationError(error: any) {
  console.error("Registration error:", error);
  if (error.name === "NotAllowedError") {
    if (error.message.includes("Operation failed")) {
      toast.error("The selected authenticator is already registered.");
    } else {
      toast.error("The operation either timed out or was not allowed or authenticator is already registered");
    }
  } else if (error.name === "NotFoundError") {
    toast.error("WebAuthn is not supported by your browser.");
  } else if (error.name === "InvalidStateError") {
    toast.error("This authenticator is already registered.");
  } else {
    toast.error(`Registration failed. ${(error as Error).message}`);
  }
}
