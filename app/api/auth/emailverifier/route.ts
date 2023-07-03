import { dbConnect } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { DbCredential } from "@/lib/webauthn";
import { generateToken, generateVerifyEmailToken, verifyToken } from "@/lib/services/token.service";
import { sendVerificationEmail } from "@/lib/services/email.service";
import { tokenTypes } from "@/lib/config/tokens";
import { Token } from "@/lib/models/token.model";
import { authOptions } from "../[...nextauth]/route";

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
    const verifyEmailToken = await generateVerifyEmailToken({ id: user?._id });
    await sendVerificationEmail(user.userInfo?.email, verifyEmailToken);
    return NextResponse.json({ success: "Verification email sent" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: any) {
  try {
    const { token } = Object.fromEntries(req.nextUrl.searchParams.entries());

    // Check if email parameter is provided
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }
    // Establishing a connection to the database
    await dbConnect();

    const userEmail = await verifyToken(token, tokenTypes.VERIFY_EMAIL);
    const user = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
      _id: userEmail.user,
    });
    if (!user) {
      throw new Error("User not found");
    }
    user.userInfo!.emailVerified = true;
    await Token.deleteMany({ user: user._id, type: tokenTypes.VERIFY_EMAIL });
    // Updating the user's credentials in the "credentials" collection of the database
    await mongoose.connection.db.collection<DbCredential>("credentials").updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          userInfo: user.userInfo,
        },
      }
    );
    return NextResponse.json({ success: "Email verified succesfully", isVerified: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message, isVerified: false }, { status: 401 });
  }
}
