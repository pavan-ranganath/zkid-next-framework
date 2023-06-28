// The `[...nextauth]` file in Next.js is a special API route used by NextAuth for handling authentication requests.
// When using NextAuth, the [...nextauth] file is created in the pages/api/auth directory of your Next.js project.
// It serves as the entry point for handling authentication requests, such as signing in, signing out, and managing user sessions.

import { dbConnect } from "@/lib/mongodb"; // Module for connecting to the database
import NextAuth from "next-auth/next"; // NextAuth module for authentication
import CredentialsProvider from "next-auth/providers/credentials"; // NextAuth credentials provider
import { verifyAuthenticationResponse } from "@simplewebauthn/server"; // Module for verifying authentication responses
import { AuthenticationResponseJSON } from "@simplewebauthn/typescript-types"; // Type definition for authentication response

import { DbCredential, getChallenge } from "@/lib/webauthn"; // Custom module for interacting with credentials and challenges
import { AuthOptions } from "next-auth"; // Type definition for NextAuth options
import mongoose from "mongoose"; // MongoDB object modeling tool
import base64url from "base64url"; // Module for handling base64url encoding and decoding

// Retrieving environment variables
const domain = process.env.APP_DOMAIN!; // The domain of the application
const origin = process.env.APP_ORIGIN!; // The origin of the application

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

// Creating the authentication handler using NextAuth and the configured options
const handler = NextAuth(authOptions);

// Exporting the authentication handler as GET and POST
export { handler as GET, handler as POST };
