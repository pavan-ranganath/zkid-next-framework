import { dbConnect } from "@/lib/mongodb";
import { DbCredential, saveChallenge } from "@/lib/webauthn";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/**
 * handles GET /api/auth/webauthn/authenticate.
 *
 * It generates and returns authentication options.
 */
dbConnect();
export async function GET(req: NextRequest) {
  const { email } = Object.fromEntries(req.nextUrl.searchParams.entries());
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  const credentials = await mongoose.connection.db
    .collection<DbCredential>("credentials")
    .find({
      userID: email,
    })
    .toArray();
  const options = generateAuthenticationOptions({
    userVerification: "preferred",
  });

  options.allowCredentials = credentials.map((c) => ({
    id: c.credentialID,
    type: "public-key",
    transports: c.transports,
  }));
  try {
    await saveChallenge({ userID: email, challenge: options.challenge });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not set up challenge." },
      { status: 500 }
    );
  }
  return NextResponse.json(options);
}
