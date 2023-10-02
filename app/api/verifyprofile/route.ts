import { dbConnect } from "@/lib/mongodb";
import { setSession, removeSession } from "@/lib/sessionMgmt";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { OpenIDTokenEndpointResponse, protectedResourceRequest } from "oauth4webapi";
import { authOptions } from "../auth/[...nextauth]/route";
import { credentailsFromTb } from "@/app/dashboard/users/service";
import mongoose from "mongoose";

export async function GET(req: NextRequest, event: NextFetchEvent) {
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
    // Accessing the "credentials" collection from the MongoDB database
    const collection = mongoose.connection.db.collection<credentailsFromTb>("credentials");

    // Querying the collection to find a document with the matching userID
    const data = await collection.findOne({ userID: email });

    // check for verification status of email, name and DOB
    if (data?.userInfo?.email.verified && data?.userInfo.dob.verified && data?.userInfo.fullName.verified) {
      // Returning a JSON response with the data and a status code of 200 (OK)
      return NextResponse.json({ status: true }, { status: 200 });
    } else {
      // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
      return NextResponse.json({ status: false }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: (error as Error)?.message }, { status: 500 });
  }
}
