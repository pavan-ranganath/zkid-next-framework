// Handling the GET request

import { dbConnect } from "@/lib/mongodb";
import { credentailsFromTb } from "@/lib/services/userService";
import { authOptions } from "@/lib/webauthn";
import { getCertificateInfoBySystemUserID } from "@/lib/zkidCertificateService";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// retrieves data based on the user's email
export async function GET(req: NextRequest, context: any) {
  // Establishing a connection to the database
  await dbConnect();

  // Retrieve query parameters from the request URL
  let { userId: userSystemID, type } = Object.fromEntries(req.nextUrl.searchParams.entries());
  if (!type) type = "nAgeVerify";
  const origin = process.env.NEXTAUTH_URL!;
  if (!userSystemID) {
    // Retrieving the user session using the "getServerSession" function
    const session = await getServerSession(authOptions);

    // Extracting the user's email from the session
    const email = session?.user?.email;

    // Checking if the user is authenticated
    if (!email) {
      // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }
    // Accessing the "credentials" collection from the MongoDB database
    const collection = mongoose.connection.db.collection<credentailsFromTb>("credentials");

    // Querying the collection to find a document with the matching userID
    const data = await collection.findOne({ userID: email });

    let _userSystemId = data?.userSystemID;
    if (!_userSystemId) {
      // Returning a JSON response with an error message and a status code of 404 (Not Found)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    userSystemID = _userSystemId;
  }
  let dbDataFromCertificateTable = await getCertificateInfoBySystemUserID(userSystemID, type);
  if (!dbDataFromCertificateTable) {
    // Returning a JSON response with an error message and a status code of 404 (Not Found)
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }
  const url = `${origin}/verifyproof?userId=${userSystemID}&type=nAgeVerify`;
  return NextResponse.json({ certificateData: dbDataFromCertificateTable.cert, shareUrl: url }, { status: 200 });
}
