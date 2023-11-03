// In this file, we can define any type of request as follows:
// export async function GET(Request) {}
// export async function HEAD(Request) {}
// export async function POST(Request) {}
// export async function PUT(Request) {}
// export async function DELETE(Request) {}

import { NextRequest, NextResponse } from "next/server"; // Import Next.js server functions for handling requests and responses
import mongoose from "mongoose"; // Import Mongoose library for MongoDB database interaction
import { Sort } from "mongodb"; // Import MongoDB Sort interface for sorting query results
import { dbConnect } from "@/lib/mongodb"; // Import custom function for connecting to MongoDB
import { ColumnSort, ColumnFilter } from "@tanstack/table-core"; // Import interfaces for column sorting and filtering
import { User, UserInterface } from "@/lib/models/user.model";

export const dynamic = "force-dynamic"; // to supress Error processing API request: DynamicServerError: Dynamic server usage: nextUrl.searchParams

// Define the type for the filter object
export type filter = {
  id: string;
  value: string;
};

// Handler function for users GET requests
// Return the JSON response with the data and pagination details
export async function GET(req: NextRequest, context: any) {
  try {
    // Establishing a connection to the database
    await dbConnect();
    let users: UserInterface[] = [];
    const _users = await User.find({});
    _users.forEach((user: any) => {
      console.log("user", user);
      users.push(user.forJSON());
    });
    // Return the JSON response
    return NextResponse.json({ users: users }, { status: 200 });
  } catch (error) {
    console.error("Error processing API request:", error);
    // Return an error response if any exception occurs
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function POST(req: NextRequest, context: any) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log("body", body);
    const user = await User.create(body);
    return NextResponse.json({ user: user.forJSON() }, { status: 201 });
  } catch (error) {
    console.error("Error processing API request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
