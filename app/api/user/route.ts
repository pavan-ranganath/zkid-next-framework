import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("zkid-next");
    const { fName, lName, email, password } = await req.json();

    const user = await db.collection("users").insertOne({
      fName,
      lName,
      email,
      password,
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    // throw new Error().message;
  }
};

export async function GET(req: any) {
  return new NextResponse("Hello");
}