/**
 * This module handles server-side requests for email verification.
 * It includes two functions: POST and GET.
 * The POST function is responsible for sending a verification email to the user.
 * The GET function is responsible for verifying the email using the provided token.
 */
import { dbConnect } from "@/lib/mongodb"; // Importing the 'dbConnect' function from the "@/lib/mongodb" module for connecting to the database
import { getServerSession } from "next-auth"; // Importing the 'getServerSession' function from "next-auth" for retrieving the server session
import { NextRequest, NextResponse } from "next/server"; // Importing 'NextRequest' and 'NextResponse' types from "next/server" for handling server-side requests and responses
import mongoose from "mongoose"; // Importing the 'mongoose' module for interacting with MongoDB
import { DbCredential, authOptions } from "@/lib/webauthn"; // Importing the 'DbCredential' type from "@/lib/webauthn" module
import { generateToken, generateVerifyEmailToken, verifyToken } from "@/lib/services/token.service"; // Importing token generation and verification functions from "@/lib/services/token.service"
import { sendVerificationEmail } from "@/lib/services/email.service"; // Importing the 'sendVerificationEmail' function from "@/lib/services/email.service"
import { tokenTypes } from "@/lib/config/tokens"; // Importing the 'tokenTypes' constant from "@/lib/config/tokens"
import { Token } from "@/lib/models/token.model"; // Importing the 'Token' model from "@/lib/models/token.model"

/**
 * Handles the POST request for sending a verification email to the user.
 * @param req The NextRequest object representing the request.
 * @param context The context object for the request.
 * @returns A NextResponse object representing the response.
 */
export async function POST(req: NextRequest, context: any) {
  try {
    // Retrieve the server session using authOptions
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    // If email is not available in the session, return an authentication error response
    if (!email) {
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }

    // Establishing a connection to the database
    await dbConnect();

    // Retrieve credentials from the database for the user's email
    const user = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
      userID: email,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Generate a verification email token
    const verifyEmailToken = await generateVerifyEmailToken({ id: user?._id });

    // Send the verification email to the user's email address
    await sendVerificationEmail(user.userInfo?.email.value, verifyEmailToken);

    return NextResponse.json({ success: "Verification email sent" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles the GET request for verifying the email using the provided token.
 * @param req The NextRequest object representing the request.
 * @param context The context object for the request.
 * @returns A NextResponse object representing the response.
 */
export async function GET(req: NextRequest, context: any) {
  try {
    const { token } = Object.fromEntries(req.nextUrl.searchParams.entries());

    // Check if token parameter is provided
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    // Establishing a connection to the database
    await dbConnect();

    // Verify the token and retrieve the user's email
    const userEmail = await verifyToken(token, tokenTypes.VERIFY_EMAIL);

    // Find the user in the database based on the retrieved email
    const user = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
      _id: userEmail.user,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Set the emailVerified flag to true
    user.userInfo!.email.verified = true;

    // Delete the verification tokens associated with the user
    await Token.deleteMany({ user: user._id, type: tokenTypes.VERIFY_EMAIL });

    // Update the user's credentials in the database
    await mongoose.connection.db.collection<DbCredential>("credentials").updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          userInfo: user.userInfo,
        },
      },
    );

    return NextResponse.json({ success: "Email verified successfully", isVerified: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message, isVerified: false }, { status: 401 });
  }
}

export const sendEmailVerification = async (email: string) => {
  try {
    // If email is not available in the session, return an authentication error response
    if (!email) {
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }

    // Establishing a connection to the database
    await dbConnect();

    // Retrieve credentials from the database for the user's email
    const user = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
      userID: email,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Generate a verification email token
    const verifyEmailToken = await generateVerifyEmailToken({ id: user?._id });

    // Send the verification email to the user's email address
    await sendVerificationEmail(user.userInfo?.email.value, verifyEmailToken);

    return NextResponse.json(
      { success: "Username and Date of birth field verified \n Verification email sent please check your email" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
};
