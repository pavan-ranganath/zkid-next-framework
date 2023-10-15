// In this file, we can define any type of request as follows:
// export async function GET(Request) {}
// export async function HEAD(Request) {}
// export async function POST(Request) {}
// export async function PUT(Request) {}
// export async function DELETE(Request) {}

import { dbConnect } from "@/lib/mongodb";
import { AadhaarXmlParser } from "@/lib/services/aadhaarService";
import { checkProfileVerifaction } from "@/lib/services/userService";
import { generateProofForAgeverification } from "@/lib/services/zkProofGenerators/ageVerificationProofGenerator";
import { authOptions } from "@/lib/webauthn";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generate ZK proof based on type of proof requested example, age verification, address verification, etc.
 *
 * @param req NextRequest
 * @param context any
 */
export async function POST(req: NextRequest, context: any) {
  try {
    // const reqObj = await req.json()
    const { claimedAge } = await req.json();
    if (!claimedAge) {
      return NextResponse.json({ error: "Claimed age not found" }, { status: 400 });
    }
    // Retrieving the user session using the "getServerSession" function
    const session = await getServerSession(authOptions);

    // Establishing a connection to the database
    await dbConnect();

    // Extracting the user's email from the session
    const email = session?.user?.email;
    // Checking if the user is authenticated
    if (!email) {
      // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }
    const profileInfo = await checkProfileVerifaction(email);
    if (!profileInfo) {
      // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
      return NextResponse.json({ error: "Profile not verified" }, { status: 401 });
    }
    const { userInfo, userSystemID, aadhaar } = profileInfo!;

    if (!userInfo) {
      // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
      return NextResponse.json({ error: "Profile info not found" }, { status: 401 });
    }
    const { dob, fullName } = userInfo;
    // get photo from aadhar
    const xmlAadhar = new AadhaarXmlParser(aadhaar!.aadhaar);
    await xmlAadhar.parseXml();
    if (!xmlAadhar) {
      console.error("XML parsing failed");
      throw new Error("XML parsing failed");
    }
    const photo = xmlAadhar.extractPhtValue;
    if (!photo) {
      console.error("Photo not found");
      throw new Error("Photo not found");
    }
    let signedXmlCertificateWithZKproof = await generateProofForAgeverification(
      new Date(dob.value),
      fullName.value,
      userSystemID,
      photo,
      claimedAge,
    );

    // store the xml certificate in db

    console.log("signedXmlCertificateWithZKproof", signedXmlCertificateWithZKproof);
    // Returning a JSON response with the user's email and a status code of 200 (OK)
    return NextResponse.json({ signedXmlCertificateWithZKproof }, { status: 200 });
  } catch (error) {
    console.error(error);
    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: (error as Error)?.message }, { status: 500 });
  }
}
