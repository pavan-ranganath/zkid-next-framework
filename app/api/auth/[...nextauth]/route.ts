import { dbConnect } from "@/lib/mongodb";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

import User from "@/lib/models/User";
import { DbCredential, getChallenge } from "@/lib/webauthn";
import { AuthOptions } from "next-auth";
import mongoose from "mongoose";
import base64url from "base64url";

dbConnect();
const domain = process.env.APP_DOMAIN!;
const origin = process.env.APP_ORIGIN!;

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Sign in with email",
      async authorize(credentials: any) {
        await dbConnect();
        try {
          const user = await User.findOne({ email: credentials.email });
          if (user) {
            // check password
            const isPasswordCorrect = await user.comparePassword(credentials.password, user.password);
            if (isPasswordCorrect) {
              return user;
            }
            throw new Error("Incorrect credentials");
          } else {
            throw new Error("User not found");
          }
        } catch (error) {
          console.error(error);
          throw new Error("Error in credential provider");
        }
      },
      credentials: {},
    }),
    CredentialsProvider({
      id: "webauthn",
      name: "Sign in with passkey",
      credentials: {},
      async authorize(cred: any, req: any): Promise<any> {
        const { id, rawId, type, clientDataJSON, authenticatorData, signature, userHandle } = req.body;
        const credential = {
          id,
          rawId,
          type,
          response: {
            clientDataJSON,
            authenticatorData,
            signature,
            userHandle,
          },
        };
        const authenticator = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
          "passkeyInfo.credentialId": credential.id,
        });
        if (!authenticator) {
          throw new Error("Authenticator not found");
        }
        const challenge = await getChallenge(authenticator.userID);
        if (!challenge) {
          throw new Error("Challenge not found");
        }
        try {
          const passkeyInfo = authenticator.passkeyInfo.find((obj) => {
            return obj.credentialId === credential.id;
          });
          if (!passkeyInfo) {
            throw new Error("Keys not found");
          }
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
          if (!verified || !info) {
            throw new Error("Verification failed");
          }
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
