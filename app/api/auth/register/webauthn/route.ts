// Import the `dbConnect` function from the "@/lib/mongodb" module
// Used to establish a connection to the MongoDB database
import { dbConnect } from "@/lib/mongodb";

// Import various functions and types from the "@/lib/webauthn" module
// These functions and types are related to WebAuthn (Web Authentication) functionality
import { DbCredential, authOptions, getChallenge, saveChallenge, saveCredentials, updateCredentials } from "@/lib/webauthn";

// Import the `generateRegistrationOptions` and `verifyRegistrationResponse` functions
// from the "@simplewebauthn/server" module
// These functions are used to generate and verify WebAuthn registration options and responses
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";

// Import the `mongoose` library for MongoDB object modeling
// Used for interacting with the MongoDB database using an Object-Document Mapping (ODM) approach
import mongoose from "mongoose";

// Import the `getServerSession` function from the "next-auth" module
// Used to retrieve the server session for authentication
import { getServerSession } from "next-auth";

// Import the `NextRequest` and `NextResponse` types from the "next/server" module
// Used to define the request and response objects for Next.js server functions
import { NextRequest, NextResponse } from "next/server";

// Import the `RegistrationResponseJSON` type from the "@simplewebauthn/typescript-types" module
// Used to define the structure of a WebAuthn registration response in JSON format
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";

// Import the `getSession` and `setSession` functions from the "@/lib/sessionMgmt" module
// Used to get and set session data in the server response
import { getSession, setSession } from "@/lib/sessionMgmt";
import { generateZKIDID } from "@/lib/services/utils";

export const dynamic = "force-dynamic"; // to supress Error processing API request: DynamicServerError: Dynamic server usage: nextUrl.searchParams

// Retrieve environment variables
const domain = process.env.APP_DOMAIN!;
const origin = process.env.NEXTAUTH_URL!;
const appName = process.env.APP_NAME!;

// Generate registration options for WebAuthn based on user details
// This function creates an object that represents the registration options
// to be sent to the client for WebAuthn registration.

// Arguments:
// - email: A string representing the user's email address.
// - fName: A string representing the user's first name.
// - lName: A string representing the user's last name.

/**
 * Generate registration options for WebAuthn based on user details.
 * This function creates an object that represents the registration options
 * to be sent to the client for WebAuthn registration.
 *
 * @param {string} email - The user's email address.
 * @param {string} fullName - The user's name.
 * @param {string} dob - The user's DOB.
 * @returns {object} An object containing the generated registration options.
 */
const generateWebAuthnOptions = (email: string, fullName: string, dob: string) => {
  /**
   * Generate registration options using the provided user details.
   *
   * @property {string} rpID - The relying party (RP) ID or domain. (Required)
   * @property {string} rpName - The name of the relying party (RP). (Required)
   * @property {string} userID - The user ID or identifier. (Required)
   * @property {string} userName - The username associated with the user. (Required)
   * @property {string} userDisplayName - The display name of the user. (Required)
   * @property {string} attestationType - The desired attestation type for the authenticator. (Optional)
   * @property {object} authenticatorSelection - The preferred authenticator selection options. (Optional)
   * @property {string} authenticatorSelection.residentKey - Whether resident keys are preferred or not. (Optional)
   * @property {boolean} authenticatorSelection.requireResidentKey - Whether resident keys are required or not. (Optional)
   * @property {string} authenticatorSelection.userVerification - The preferred user verification requirement. (Optional)
   * @property {number[]} supportedAlgorithmIDs - The supported cryptographic algorithm IDs. (Optional)
   */
  const options = generateRegistrationOptions({
    rpID: domain,
    rpName: appName,
    userID: email,
    userName: email,
    userDisplayName: `${fullName}`,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      requireResidentKey: false,
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: [-7, -257],
  });

  // Return the generated registration options
  return options;
};

/**
 * Verify the registration response received from the client.
 * This function verifies the validity of the registration response and
 * checks if it matches the expected values (RPID, origin, and challenge).
 *
 * @param {object} response - The registration response object received from the client.
 * @param {string} expectedRPID - The expected Relying Party (RP) ID or domain.
 * @param {string} expectedOrigin - The expected origin for the registration.
 * @param {string} expectedChallenge - The expected challenge value.
 */
const verifyWebAuthnRegistrationResponse = async (
  response: RegistrationResponseJSON,
  expectedRPID: string | string[] | undefined,
  expectedOrigin: string | string[],
  expectedChallenge: string,
) => {
  /**
   * Verify the registration response received from the client.
   *
   * @property {object} response - The registration response object received from the client. (Required)
   * @property {string} expectedRPID - The expected Relying Party (RP) ID or domain. (Required)
   * @property {string} expectedOrigin - The expected origin for the registration. (Required)
   * @property {string} expectedChallenge - The expected challenge value. (Required)
   */
  const { verified, registrationInfo: info } = await verifyRegistrationResponse({
    response,
    expectedRPID,
    expectedOrigin,
    expectedChallenge,
  });

  // Return the verification result and registration information
  return { verified, registrationInfo: info };
};

// Helper function to handle errors related to challenge setup
const handleChallengeError = (message: string) => {
  return NextResponse.json({ error: message }, { status: 500 });
};

// Helper function to handle errors related to invalid response
const handleInvalidResponseError = () => {
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
};

const PASSKEY_SESSION_NAME = "PASSKEY_REGISTRATION";
// Handler function for GET requests
/**
 *  Generating WebAuthn (Web Authentication) registration options, handling user registration, and saving the credentials in a MongoDB database.
 *  It also includes necessary validation and error handling for the registration process.
 */
export async function GET(req: NextRequest, context: any) {
  // Establishing a connection to the database
  await dbConnect();

  // Retrieve the server session using authOptions
  const session = await getServerSession(authOptions);

  // Check if a session exists and add passkey information to existing user
  if (session) {
    const email = session?.user?.email;

    // If email is not available in the session, return an authentication error response
    if (!email) {
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }

    // Retrieve credentials from the database for the user's email
    const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
      userID: email,
    });

    // Generate registration options based on the user's email and credentials
    const options = await generateWebAuthnOptions(
      email,
      credentials?.userInfo?.fullName.value!,
      credentials?.userInfo?.dob.value!,
    );
    // Check if options are generated
    if (!options) {
      return NextResponse.json({ error: "Error generating options" }, { status: 400 });
    }
    // Exclude previously registered credentials from the registration options
    options.excludeCredentials = credentials?.passkeyInfo.map((c) => ({
      id: c.credentialId,
      type: "public-key",
      transports: c.credential.response.transports,
    }));

    try {
      // Save the challenge for the user
      await saveChallenge({ userID: email, challenge: options.challenge });
    } catch (err) {
      return handleChallengeError("Could not set up challenge.");
    }

    return NextResponse.json(options);
  }

  // If there is no session, it means the user is not authenticated
  // Proceed with the registration process for a new user

  // Retrieve query parameters from the request URL
  const { fullName, dob, email, mobile } = Object.fromEntries(req.nextUrl.searchParams.entries());

  // Check if the user already has credentials in the database
  const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
    userID: email,
  });

  // If credentials already exist, return an error response
  if (credentials) {
    return NextResponse.json({ error: "Email already registered" }, { status: 500 });
  }

  // Generate registration options based on the provided user details
  const options = await generateWebAuthnOptions(email, fullName, dob);

  // Check if options are generated
  if (!options) {
    return NextResponse.json({ error: "Error generating options" }, { status: 400 });
  }
  try {
    // Save the challenge for the user
    await saveChallenge({ userID: email, challenge: options.challenge });
  } catch (err) {
    return handleChallengeError("Could not set up challenge.");
  }

  // Create a response with the registration options and set the session
  const response = NextResponse.json(options);
  setSession(response, { name: PASSKEY_SESSION_NAME, value: { user: { email, fullName, dob, mobile } } });
  return response;
}

// Handler function for POST requests
export async function POST(req: NextRequest, context: any) {
  // Establishing a connection to the database
  await dbConnect();

  // Retrieve the session from the request
  const session = getSession(req, PASSKEY_SESSION_NAME) as any;
  const { user } = session;

  // If the user is not connected or doesn't have an email, return an error response
  if (!user || !user.email) {
    return NextResponse.json({ error: "You are not connected." }, { status: 401 });
  }

  // Retrieve the challenge for the user's email
  const challenge = await getChallenge(user.email);

  // If challenge doesn't exist, return an error response
  if (!challenge) {
    return handleChallengeError("Pre-registration is required.");
  }

  // Parse the registration response received in the request body
  const credential: RegistrationResponseJSON = await req.json();

  /**
   * Verify the registration response received from the client.
   * This function verifies the response data sent by the client during
   * WebAuthn registration and performs necessary checks for authenticity.
   */
  const { verified, registrationInfo: info } = await verifyWebAuthnRegistrationResponse(
    credential,
    domain,
    origin,
    challenge.value,
  );

  // If the response is not verified or missing registration info, return an error response
  if (!verified || !info) {
    return handleInvalidResponseError();
  }

  try {
    // Save the credentials for the user
    await saveCredentials({
      userID: user.email,
      userSystemID: generateZKIDID(user.mobile, new Date(user.dob)),
      passkeyInfo: [
        {
          friendlyName: `Passkey-${Math.floor(100000 + Math.random() * 900000)}`,
          credential: { ...credential },
          registrationInfo: { verified, registrationInfo: info },
          credentialId: credential.id,
        },
      ],
      userInfo: {
        email: { value: user.email, verified: false },
        fullName: { value: user.fullName, verified: false },
        dob: { value: user.dob, verified: false },
        mobile: { value: user.mobile, verified: false },
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Could not register the credential.", err);
    return NextResponse.json({ error: "Could not register the credential." }, { status: 500 });
  }
}

// Handler function for PUT requests
export async function PUT(req: NextRequest, context: any) {
  // Establishing a connection to the database
  await dbConnect();

  // Retrieve the server session using authOptions
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // If the user is not connected or doesn't have an email, return an error response
  if (!user?.email) {
    return NextResponse.json({ error: "You are not connected." }, { status: 401 });
  }

  // Retrieve the challenge for the user's email
  const challenge = await getChallenge(user.email);

  // If challenge doesn't exist, return an error response
  if (!challenge) {
    return handleChallengeError("Pre-registration is required.");
  }

  // Parse the registration response received in the request body
  const credential: RegistrationResponseJSON = await req.json();

  /**
   * Verify the registration response received from the client.
   * This function verifies the response data sent by the client during
   * WebAuthn registration and performs necessary checks for authenticity.
   */
  const { verified, registrationInfo: info } = await verifyWebAuthnRegistrationResponse(
    credential,
    domain,
    origin,
    challenge.value,
  );

  // If the response is not verified or missing registration info, return an error response
  if (!verified || !info) {
    return handleInvalidResponseError();
  }

  try {
    // Update the user's credentials with the new credential(passkey)
    await updateCredentials(
      {
        friendlyName: `Passkey-${Math.floor(100000 + Math.random() * 900000)}`,
        credential: { ...credential },
        registrationInfo: { verified, registrationInfo: info },
        credentialId: credential.id,
      },
      user.email,
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Could not register the credential.", err);
    return NextResponse.json({ error: "Could not register the credential." }, { status: 500 });
  }
}
