import { dbConnect } from "@/lib/mongodb"; // Imports the function for connecting to the MongoDB database
import { DbCredential, saveChallenge } from "@/lib/webauthn"; // Imports the necessary functions related to web authentication
import { generateAuthenticationOptions } from "@simplewebauthn/server"; // Imports a function for generating authentication options
import mongoose from "mongoose"; // Imports the mongoose library for MongoDB interaction
import { NextRequest, NextResponse } from "next/server"; // Imports the Next.js request and response objects

export const dynamic = "force-dynamic"; // to supress Error processing API request: DynamicServerError: Dynamic server usage: nextUrl.searchParams

const domain = process.env.APP_DOMAIN!;

/**
 * Handles GET /api/auth/authenticate.
 *
 * It generates and returns authentication options.
 */

// Define the GET request handler function
/**
 * retrieves credentials associated with an email, generates authentication options,
 * saves the authentication challenge, and returns the generated authentication options in the response
 */
export async function GET(req: NextRequest) {
  // Establishing a connection to the database
  await dbConnect();

  let { email } = Object.fromEntries(req.nextUrl.searchParams.entries());

  // Check if email parameter is provided
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  email = email.toLowerCase().trim();
  // Find the credentials associated with the provided email in the database
  const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
    userID: email,
  });

  // Check if credentials are found for the provided email
  if (!credentials) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
  }

  /**
   * Generate authentication options for the web authentication process.
   * - rpID: The relying party identifier (domain) for which the authentication options are being generated.
   * - userVerification: Specifies the preferred user verification requirement (e.g., "required", "preferred", "discouraged").
   */
  const options = await generateAuthenticationOptions({
    rpID: domain,
    userVerification: "preferred",
  });
  console.log("options", options);

  // Check if options are generated
  if (!options) {
    return NextResponse.json({ error: "Error generating options" }, { status: 400 });
  }
  // Update the authentication options with the allowed credentials
  // Authenticators previously registered by the user
  options.allowCredentials = credentials?.passkeyInfo.map((c) => ({
    id: c.credentialId,
    type: "public-key",
    transports: c.credential.response.transports,
  }));

  try {
    // Save the authentication challenge associated with the user
    await saveChallenge({ userID: email, challenge: options.challenge });
  } catch (err) {
    return NextResponse.json({ error: "Could not set up challenge." }, { status: 500 });
  }

  // Return the generated authentication options
  return NextResponse.json(options);
}
