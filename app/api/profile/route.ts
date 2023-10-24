import { dbConnect } from "@/lib/mongodb";
import { setSession, removeSession } from "@/lib/sessionMgmt";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { OpenIDTokenEndpointResponse, protectedResourceRequest } from "oauth4webapi";
import mongoose from "mongoose";
import { authOptions } from "@/lib/webauthn";
import { checkProfileVerification, credentailsFromTb, deleteProfile } from "@/lib/services/userService";

/**
 * Checks if the user is authenticated and returns the user's profile verification status
 * @param req NextRequest
 * @param event any
 * @returns NextResponse
 */
export async function GET(req: NextRequest, event: any) {
  // Retrieving the user session using the "getServerSession" function
  const session = await getServerSession(authOptions);

  // Extracting the user's email from the session
  const email = session?.user?.email;

  // Checking if the user is authenticated
  if (!email) {
    // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }
  // Establishing a connection to the database
  await dbConnect();
  try {
    const profileVerified = await checkProfileVerification(email);
    if (profileVerified) {
      // Returning a JSON response with the data and a status code of 200 (OK)
      return NextResponse.json({ status: true }, { status: 200 });
    }
    // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
    return NextResponse.json({ status: false }, { status: 200 });
  } catch (error) {
    console.error(error);
    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: (error as Error)?.message }, { status: 500 });
  }
}

/**
 * Checks if the user is authenticated and delete the user's profile
 * @param req NextRequest
 * @param event any
 * @returns NextResponse
 */
export async function DELETE(req: NextRequest, event: any) {
  // Retrieving the user session using the "getServerSession" function
  const session = await getServerSession(authOptions);

  // Extracting the user's email from the session
  const email = session?.user?.email;

  // Checking if the user is authenticated
  if (!email) {
    // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }
  // Establishing a connection to the database
  await dbConnect();
  try {
    const profileDeleted = await deleteProfile(email);
    if (profileDeleted) {
      // Returning a JSON response with the data and a status code of 200 (OK)
      return NextResponse.json({ status: true }, { status: 200 });
    }
    // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
    return NextResponse.json({ status: false }, { status: 404 });
  } catch (error) {
    console.error(error);
    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: (error as Error)?.message }, { status: 500 });
  }
}
