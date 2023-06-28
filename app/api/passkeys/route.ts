import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Sort } from "mongodb";
import { dbConnect } from "@/lib/mongodb";
import { ColumnSort, ColumnFilter } from "@tanstack/table-core";
import { getServerSession } from "next-auth";
import { credentailsFromTb } from "@/app/dashboard/users/service";
import { authOptions } from "../auth/[...nextauth]/route";

dbConnect();
export type filter = {
  id: string;
  value: string;
};
export async function GET(req: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }
  try {
    const collection = mongoose.connection.db.collection<credentailsFromTb>("credentials");

    const data = await collection.findOne({ userID: email });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing API request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
