// The `mongoose` library is imported to enable integration with MongoDB.
// It provides an easy-to-use object data modeling (ODM) for managing interactions with the database.
import mongoose from "mongoose";

// The `RegistrationResponseJSON` type is imported from the "@simplewebauthn/typescript-types" module.
// It is used to define the structure of a registration response JSON object related to a web authentication process.
import { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/typescript-types";

// The `VerifiedRegistrationResponse` type is imported from the "@simplewebauthn/server" module.
// It is used to define the structure of a verified registration response object, which contains information about a successful registration process.
import { VerifiedRegistrationResponse, verifyAuthenticationResponse } from "@simplewebauthn/server";

// The `dbConnect` function is imported from a local file named "mongodb.js". Custom function responsible for establishing a connection to the MongoDB database.
import toast from "react-hot-toast";
import base64url from "base64url";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"; // NextAuth credentials provider
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
  userSystemID: string; // The ID of the user associated with the credential fr system
  passkeyInfo: passkeyObj[]; // An array of passkey objects containing information about the user's passkeys
  userInfo?: {
    fullName: Field<string>; // The first name of the user
    email: Field<string>; // The email address of the user
    dob: Field<number>; // The last name of the user
    mobile: Field<string>; // The last name of the user
  };
  aadhaar?: {
    aadhaar: string;
    digiLockerUserInfo: string;
  };
  photo?: string;
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
    .collection<{ userID: string; value: string; userSystemId: string }>("challenge")
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
    userSystemID: cred.userSystemID, // Storing the user's system ID
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

// Retrieving environment variables
const domain = process.env.APP_DOMAIN!; // The domain of the application
const origin = process.env.NEXTAUTH_URL!; // The origin of the application

// Configuration options for NextAuth
export const authOptions: AuthOptions = {
  providers: [
    // Configuring the webauthn CredentialsProvider for NextAuth
    CredentialsProvider({
      id: "webauthn",
      name: "Sign in with passkey",
      credentials: {},
      async authorize(cred: any, req: any): Promise<any> {
        // Destructuring properties from the request body
        const { id, rawId, type, clientDataJSON, authenticatorData, signature, userHandle } = req.body;

        // Creating a credential object
        const credential: AuthenticationResponseJSON = {
          id,
          rawId,
          type,
          response: {
            clientDataJSON,
            authenticatorData,
            signature,
            userHandle,
          },
          clientExtensionResults: {},
        };

        // Retrieving the authenticator from the database
        const authenticator = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
          "passkeyInfo.credentialId": credential.id,
        });

        // Handling the case when the authenticator is not found
        if (!authenticator) {
          throw new Error("Authenticator not found");
        }

        // Retrieving the challenge for the authenticator
        const challenge = await getChallenge(authenticator.userID);

        // Handling the case when the challenge is not found
        if (!challenge) {
          throw new Error("Challenge not found");
        }

        try {
          // Finding the passkey information for the given credential ID
          const passkeyInfo = authenticator.passkeyInfo.find((obj) => {
            return obj.credentialId === credential.id;
          });

          // Handling the case when the passkey information is not found
          if (!passkeyInfo) {
            throw new Error("Keys not found");
          }

          // Verifying the authentication response
          // used to validate and verify the authenticity of a web authentication response by comparing it against the expected challenge, origin, RPID, and authenticator information
          const { verified, authenticationInfo: info } = await verifyAuthenticationResponse({
            expectedChallenge: challenge.value,
            expectedOrigin: origin,
            expectedRPID: domain,
            authenticator: {
              credentialPublicKey: passkeyInfo.registrationInfo.registrationInfo?.credentialPublicKey.buffer as Buffer,
              credentialID: base64url.toBuffer(passkeyInfo.credentialId),
              counter: passkeyInfo.registrationInfo.registrationInfo!.counter,
            },
            response: {
              id,
              rawId,
              response: {
                clientDataJSON,
                authenticatorData,
                signature,
                userHandle,
              },
              clientExtensionResults: {},
              type,
            },
          });

          // Handling the case when verification fails
          if (!verified || !info) {
            throw new Error("Verification failed");
          }

          // Updating the counter value for the authenticator (commented out)
          // await mongoose.connection.db
          //   .collection<DbCredential>("credentials")
          //   .updateOne(
          //     {
          //       _id: authenticator._id,
          //     },
          //     {
          //       $set: {
          //         counter: info.newCounter,
          //       },
          //     }
          //   );
        } catch (error) {
          console.log(error);
          throw new Error("Verification failed");
        }

        // Returning the user's email
        return { email: authenticator.userID };
      },
    }),
  ],
  pages: {
    error: "/signin",
  },
  session: {
    strategy: "jwt",
  },
};
