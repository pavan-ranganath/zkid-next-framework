import {dbConnect} from "@/lib/mongodb";
import { NextRequest, NextResponse } from 'next/server'
import  User  from "@/lib/models/User";
import createHttpError from "http-errors";

dbConnect()
export async function POST(req: NextRequest) {
  try {
    
    const { fName, lName, email, password } = await req.json();
    let u = new User({fName, lName, email, password})
    await u.encryptPassword();
    let t = await u.save();
    return NextResponse.json(t);
  } catch (err:any) {

      if (err && err.name === 'MongoServerError' && err.code === 11000) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      }
      else if(err.message) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      } else {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
        
      }
    }
};

export async function GET(req: any) {
  return new NextResponse("Hello");
}