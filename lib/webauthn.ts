import { Binary } from "mongodb";
import { dbConnect } from "./mongodb";
import mongoose from "mongoose";
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { VerifiedRegistrationResponse } from "@simplewebauthn/server";

export interface passkeyObj {
  credentialId: string;
  friendlyName: string;
  credential: RegistrationResponseJSON;
  registrationInfo: VerifiedRegistrationResponse;
}
export interface DbCredential {
  userID: string;
  passkeyInfo: passkeyObj[];
  userInfo?: {
    firstName: string;
    email: string;
    emailVerified: string;
    lastName: string;
  };
}
dbConnect();

export async function saveChallenge({
  userID,
  challenge,
}: {
  challenge: string;
  userID: string;
}) {
  console.log("saveChallenge", challenge, userID);

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
      upsert: true,
    }
  );
}

export async function getChallenge(userID: string) {
  const challengeObj = await mongoose.connection.db
    .collection<{ userID: string; value: string }>("challenge")
    .findOneAndDelete({
      userID,
    });
  return challengeObj.value;
}

/**
 * saveCredentials stores the user's public key in the database.
 * @param cred user's public key
 */
// export async function saveCredentials(cred: {
//   transports: AuthenticatorTransport[];
//   credentialID: string;
//   counter: number;
//   userID: string;
//   key: Binary | Buffer;
// }) {
//   await mongoose.connection.db
//     .collection<DbCredential>("credentials")
//     .insertOne({
//       credentialID: cred.credentialID,
//       transports: cred.transports,
//       userID: cred.userID,
//       credentialPublicKey: cred.key,
//       counter: cred.counter,
//     });
// }

/**
 * saveCredentials stores the user's public key in the database.
 * @param cred user's public key
 */
export async function saveCredentials(cred: DbCredential) {
  await mongoose.connection.db
    .collection<DbCredential>("credentials")
    .insertOne({
      userID: cred.userID,
      passkeyInfo: cred.passkeyInfo,
      userInfo: cred.userInfo,
    });
}
