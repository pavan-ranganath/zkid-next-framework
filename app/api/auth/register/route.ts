import {dbConnect} from "@/lib/mongodb";
import { NextRequest, NextResponse } from 'next/server'
import  User  from "@/lib/models/User";
import { Model } from "mongoose";
dbConnect()
export async function POST(req: NextRequest) {
  try {
    
    const { fName, lName, email, password } = await req.json();
    let u = new User({fName, lName, email, password})
    await u.encryptPassword();
    let t = await u.save();
    return NextResponse.json(t);
  } catch (e) {
    console.error(e);
    throw new Error("Error adding data to table");
  }
};

export async function GET(req: any) {
  return new NextResponse("Hello");
}