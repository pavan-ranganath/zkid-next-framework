import { NextRequest, NextResponse } from "next/server"; // Importing NextRequest and NextResponse from the "next/server" module for handling HTTP requests and responses
import mongoose from "mongoose"; // Importing Mongoose for MongoDB database connection and querying
import { dbConnect } from "@/lib/mongodb"; // Importing the "dbConnect" function from the local module "@/lib/mongodb" for connecting to the MongoDB database
import { getServerSession } from "next-auth"; // Importing the "getServerSession" function from the "next-auth" module for retrieving the user session
import { credentailsFromTb } from "@/app/dashboard/users/service"; // Importing the "credentailsFromTb" type from the local module "@/app/dashboard/users/service" for defining the type of a collection document
import { authOptions } from "../auth/[...nextauth]/route"; // Importing the "authOptions" object from the local module "../auth/[...nextauth]/route" for configuring authentication options

// Establishing a connection to the MongoDB database
dbConnect();

// Defining a type for the filter object
export type filter = {
  id: string;
  value: string;
};

// Handling the GET request
// retrieves data based on the user's email
export async function GET(req: NextRequest, context: any) {
  // Retrieving the user session using the "getServerSession" function
  const session = await getServerSession(authOptions);

  // Extracting the user's email from the session
  const email = session?.user?.email;

  // Checking if the user is authenticated
  if (!email) {
    // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  try {
    // Accessing the "credentials" collection from the MongoDB database
    const collection = mongoose.connection.db.collection<credentailsFromTb>("credentials");

    // Querying the collection to find a document with the matching userID
    const data = await collection.findOne({ userID: email });

    // Returning a JSON response with the retrieved data
    return NextResponse.json(data);
  } catch (error) {
    // Handling any errors that occur during the API request processing
    console.error("Error processing API request:", error);

    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
