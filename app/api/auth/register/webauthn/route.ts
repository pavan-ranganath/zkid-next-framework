import { dbConnect } from "@/lib/mongodb";
import { DbCredential, getChallenge, saveChallenge, saveCredentials, updateCredentials } from "@/lib/webauthn";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { getSession, setSession } from "@/lib/sessionMgmt";

const domain = process.env.APP_DOMAIN!;
const origin = process.env.APP_ORIGIN!;
const appName = process.env.APP_NAME!;

dbConnect();
export async function GET(req: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (session) {
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }
    const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
      userID: email,
    });
    const options = generateRegistrationOptions({
      rpID: domain,
      rpName: appName,
      userID: email,
      userName: email,
      userDisplayName: `${credentials?.userInfo?.firstName} ${credentials?.userInfo?.lastName}`,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        requireResidentKey: false,
        userVerification: "preferred",
      },

      // This Relying Party will accept either an ES256 or RS256 credential, but
      // prefers an ES256 credential.
      supportedAlgorithmIDs: [-7, -257],
    });
    options.excludeCredentials = credentials?.passkeyInfo.map((c) => ({
      id: c.credentialId,
      type: "public-key",
      transports: c.credential.response.transports,
    }));
    try {
      await saveChallenge({ userID: email, challenge: options.challenge });
    } catch (err) {
      return NextResponse.json({ error: "Could not set up challenge." }, { status: 500 });
    }
    const t = NextResponse.json(options);
    // setSession(t, { user: { email, fName, lName } });
    return t;
  }
  const { fName, lName, email } = Object.fromEntries(req.nextUrl.searchParams.entries());
  const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
    userID: email,
  });

  if (credentials) {
    return NextResponse.json({ error: "Email already registered" }, { status: 500 });
  }
  const options = generateRegistrationOptions({
    rpID: domain,
    rpName: appName,
    userID: email,
    userName: email,
    userDisplayName: `${fName} ${lName}`,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      requireResidentKey: false,
      userVerification: "preferred",
    },

    // This Relying Party will accept either an ES256 or RS256 credential, but
    // prefers an ES256 credential.
    supportedAlgorithmIDs: [-7, -257],
  });
  try {
    await saveChallenge({ userID: email, challenge: options.challenge });
  } catch (err) {
    return NextResponse.json({ error: "Could not set up challenge." }, { status: 500 });
  }
  const t = NextResponse.json(options);
  setSession(t, { user: { email, fName, lName } });
  return t;
}

export async function POST(req: NextRequest, context: any) {
  // let session = await getServerSession(authOptions);
  const session = getSession(req) as any;
  const { user } = session;
  if (!user) {
    return NextResponse.json({ error: "You are not connected." }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "You are not connected." }, { status: 401 });
  }
  const challenge = await getChallenge(user.email);
  if (!challenge) {
    return NextResponse.json({ error: "Pre-registration is required." }, { status: 401 });
  }
  const credential: RegistrationResponseJSON = await req.json();
  const { verified, registrationInfo: info } = await verifyRegistrationResponse({
    response: credential,
    expectedRPID: domain,
    expectedOrigin: origin,
    expectedChallenge: challenge.value,
  });
  if (!verified || !info) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  try {
    await saveCredentials({
      userID: user.email,
      passkeyInfo: [
        {
          friendlyName: `Passkey-${Math.floor(100000 + Math.random() * 900000)}`,
          credential: { ...credential },
          registrationInfo: { verified, registrationInfo: info },
          credentialId: credential.id,
        },
      ],
      userInfo: {
        email: user.email,
        firstName: user.fName,
        lastName: user.lName,
        emailVerified: false,
      },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Could not register the credential.", err);
    return NextResponse.json({ error: "Could not register the credential." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.email) {
    return NextResponse.json({ error: "You are not connected." }, { status: 401 });
  }
  const challenge = await getChallenge(user.email);
  if (!challenge) {
    return NextResponse.json({ error: "Pre-registration is required." }, { status: 401 });
  }
  const credential: RegistrationResponseJSON = await req.json();
  const { verified, registrationInfo: info } = await verifyRegistrationResponse({
    response: credential,
    expectedRPID: domain,
    expectedOrigin: origin,
    expectedChallenge: challenge.value,
  });
  if (!verified || !info) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  try {
    await updateCredentials(
      {
        friendlyName: `Passkey-${Math.floor(100000 + Math.random() * 900000)}`,
        credential: { ...credential },
        registrationInfo: { verified, registrationInfo: info },
        credentialId: credential.id,
      },
      user.email
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Could not register the credential.", err);
    return NextResponse.json({ error: "Could not register the credential." }, { status: 500 });
  }
}
