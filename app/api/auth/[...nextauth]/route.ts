import { dbConnect } from "@/lib/mongodb";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

import User from "@/lib/models/User";
import { DbCredential, getChallenge } from "@/lib/webauthn";
import { RequestInternal, Awaitable, AuthOptions } from "next-auth";
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
          .collection<DbCredential>("credentials")
          .findOne({
            userID: credential.response.userHandle,
          });
        if (!authenticator) {
          throw new Error("Authenticator not found");
        }
        const challenge = await getChallenge(authenticator.userID);
        if (!challenge) {
          throw new Error("Challenge not found");
        }
        try {
          let t = authenticator.passkeyInfo[0];
          const { verified, authenticationInfo: info } =
            await verifyAuthenticationResponse({
              expectedChallenge: challenge.value,
              expectedOrigin: origin,
              expectedRPID: domain,
              authenticator: {
                credentialPublicKey: t.registrationInfo.registrationInfo
                  ?.credentialPublicKey.buffer as Buffer,
                credentialID: base64url.toBuffer(
                  authenticator.passkeyInfo[0].credentialId
                ),
                counter: t.registrationInfo.registrationInfo!.counter,
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
