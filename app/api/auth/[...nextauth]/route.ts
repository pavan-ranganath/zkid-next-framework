import { dbConnect } from "@/lib/mongodb";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

import User from "@/lib/models/User";
import { DbCredential, getChallenge } from "@/lib/webauthn";
import { RequestInternal, Awaitable } from "next-auth";
import mongoose from "mongoose";
import base64url from "base64url";

dbConnect();
const domain = process.env.APP_DOMAIN!;
const origin = process.env.APP_ORIGIN!;

export const authOptions = {
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
            const isPasswordCorrect = await user.comparePassword(
              credentials.password,
              user.password
            );
            if (isPasswordCorrect) {
              return user;
            } else {
              throw new Error("Incorrect credentials");
            }
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
      authorize: async function (cred: any, req: any): Promise<any> {
        const {
          id,
          rawId,
          type,
          clientDataJSON,
          authenticatorData,
          signature,
          userHandle,
        } = req.body;
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
        const authenticator = await mongoose.connection.db
          .collection<DbCredential & Document>("credentials")
          .findOne({
            credentialID: credential.id,
          });
        if (!authenticator) {
          return null;
        }
        const challenge = await getChallenge(authenticator.userID);
        if (!challenge) {
          return null;
        }
        try {
          const { verified, authenticationInfo: info } =
            await verifyAuthenticationResponse({
              // credential: credential,
              expectedChallenge: challenge.value,
              expectedOrigin: origin,
              expectedRPID: domain,
              authenticator: {
                credentialPublicKey: authenticator.credentialPublicKey
                  .buffer as Buffer,
                credentialID: base64url.toBuffer(authenticator.credentialID),
                counter: authenticator.counter,
              },
              response: {
                id: id,
                rawId: rawId,
                response: {
                  clientDataJSON,
                  authenticatorData,
                  signature,
                  userHandle,
                },
                clientExtensionResults: {},
                type: type,
              },
            });
          if (!verified || !info) {
            return null;
          }
          await mongoose.connection.db
            .collection<DbCredential>("credentials")
            .updateOne(
              {
                _id: authenticator._id,
              },
              {
                $set: {
                  counter: info.newCounter,
                },
              }
            );
        } catch (error) {
          console.log(error);
          return null;
        }
        return { email: authenticator.userID };
      },
    }),
  ],
  pages: {
    error: "/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
