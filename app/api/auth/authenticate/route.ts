// Import the necessary modules and functions
import { dbConnect } from "@/lib/mongodb"; // Imports the function for connecting to the MongoDB database
import { DbCredential, saveChallenge } from "@/lib/webauthn"; // Imports the necessary functions related to web authentication
import { generateAuthenticationOptions } from "@simplewebauthn/server"; // Imports a function for generating authentication options
import mongoose from "mongoose"; // Imports the mongoose library for MongoDB interaction
import { NextRequest, NextResponse } from "next/server"; // Imports the Next.js request and response objects

const domain = process.env.APP_DOMAIN!;

/**
 * Handles GET /api/auth/authenticate.
 *
 * It generates and returns authentication options.
 */

// Connect to the MongoDB database
dbConnect();

// Define the GET request handler function
/**
 * retrieves credentials associated with an email, generates authentication options,
 * saves the authentication challenge, and returns the generated authentication options in the response
 */
export async function GET(req: NextRequest) {
  const { email } = Object.fromEntries(req.nextUrl.searchParams.entries());

  // Check if email parameter is provided
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Find the credentials associated with the provided email in the database
  const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
    userID: email,
  });

  /**
   * Generate authentication options for the web authentication process.
   * - rpID: The relying party identifier (domain) for which the authentication options are being generated.
   * - userVerification: Specifies the preferred user verification requirement (e.g., "required", "preferred", "discouraged").
   */
  const options = generateAuthenticationOptions({
    rpID: domain,
    userVerification: "preferred",
  });

  // Check if credentials are found for the provided email
  if (!credentials) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 });
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
