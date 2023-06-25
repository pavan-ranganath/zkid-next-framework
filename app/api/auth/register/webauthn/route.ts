import { dbConnect } from "@/lib/mongodb";
import {
  DbCredential,
  getChallenge,
  saveChallenge,
  saveCredentials,
} from "@/lib/webauthn";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { destroySession, getSession, setSession } from "@/lib/sessionMgmt";

const domain = process.env.APP_DOMAIN!;
const origin = process.env.APP_ORIGIN!;
const appName = process.env.APP_NAME!;

dbConnect();
export async function GET(req: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  const { fName, lName, email } = Object.fromEntries(
    req.nextUrl.searchParams.entries()
  );
  const credentials = await mongoose.connection.db
    .collection<DbCredential>("credentials")
    .find({
      userID: email,
    })
    .toArray();
  if (credentials.length) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 500 }
    );
  }
  const options = generateRegistrationOptions({
    rpID: domain,
    rpName: appName,
    userID: email,
    userName: email,
    userDisplayName: `${fName} ${lName}`,
    attestationType: "none",
    authenticatorSelection: {
      userVerification: "preferred",
    },
  });
  try {
    await saveChallenge({ userID: email, challenge: options.challenge });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not set up challenge." },
      { status: 500 }
    );
  }
  let t = NextResponse.json(options);
  setSession(t, { user: { email } });
  return t;
}

export async function POST(req: NextRequest, context: any) {
  // const session = await getServerSession(authOptions);
  let session = getSession(req) as any;
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: "You are not connected." },
      { status: 401 }
    );
  }
  const challenge = await getChallenge(email);
  if (!challenge) {
    return NextResponse.json(
      { error: "Pre-registration is required." },
      { status: 401 }
    );
  }
  const credential: RegistrationResponseJSON = await req.json();
  const { verified, registrationInfo: info } = await verifyRegistrationResponse(
    {
      response: credential,
      expectedRPID: domain,
      expectedOrigin: origin,
      expectedChallenge: challenge.value,
    }
  );
  if (!verified || !info) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
  try {
    await saveCredentials({
      credentialID: credential.id,
      transports: (credential.response.transports as []) ?? ["internal"],
      userID: email,
      key: Buffer.from(info.credentialPublicKey.buffer),
      counter: info.counter,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Could not register the credential.", err);
    return NextResponse.json(
      { error: "Could not register the credential." },
      { status: 500 }
    );
  }
}