// In this file, we can define any type of request as follows:
// export async function GET(Request) {}
// export async function HEAD(Request) {}
// export async function POST(Request) {}
// export async function PUT(Request) {}
// export async function DELETE(Request) {}

import { dbConnect } from "@/lib/mongodb";
import { AadhaarXmlParser } from "@/lib/services/aadhaarService";
import { checkProfileVerification } from "@/lib/services/userService";
import { epochToDate } from "@/lib/services/utils";
import { generateProofForAgeverification } from "@/lib/services/zkProofGenerators/ageVerificationProofGenerator";
import { authOptions } from "@/lib/webauthn";
import { deleteCertificate, storeCertificate } from "@/lib/zkidCertificateService";
import moment from "moment";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const nZKPCertType = "nAgeVerify";
/**
 * Generate ZK proof based on type of proof requested example, age verification, address verification, etc.
 *
 * @param req NextRequest
 * @param context any
 */
export async function POST(req: NextRequest, context: any) {
  try {
    // const reqObj = await req.json()
    const { claimAge, claimDate } = await req.json();
    if (!claimAge) {
      return NextResponse.json({ error: "Claimed age not found" }, { status: 400 });
    }
    if (!claimDate) {
      return NextResponse.json({ error: "Claimed date not found" }, { status: 400 });
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
    const profileInfo = await checkProfileVerification(email);
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
    const signedXmlCertificateWithZKproof = await generateProofForAgeverification(
      moment(dob.value).toDate(),
      fullName.value,
      userSystemID,
      photo,
      claimAge,
      moment(claimDate).toDate(),
    );

    // store the xml certificate in db
    const xmlDocSaved = await storeCertificate(signedXmlCertificateWithZKproof, userSystemID);
    if (!xmlDocSaved?.acknowledged) {
      console.error("XML certificate not saved");
      throw new Error("XML certificate not saved");
    }
    // const insertedId = xmlDocSaved.insertedId.toString();
    const origin = process.env.NEXTAUTH_URL!;
    const url = `${origin}/verifyproof?userId=${userSystemID}&type=nAgeVerify`;
    return NextResponse.json({ certificateData: signedXmlCertificateWithZKproof, shareUrl: url }, { status: 200 });
  } catch (error) {
    console.error(error);
    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: (error as Error)?.message }, { status: 500 });
  }
}

/**
 * DELETE request
 * @param req NextRequest
 * @param context any
 */
export async function DELETE(req: NextRequest, context: any) {
  try {
    // Establishing a connection to the database
    await dbConnect();

    // Retrieving the user session using the "getServerSession" function
    const session = await getServerSession(authOptions);

    // Extracting the user's email from the session
    const email = session?.user?.email;
    // Checking if the user is authenticated
    if (!email) {
      // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    }
    const profileInfo = await checkProfileVerification(email);
    if (!profileInfo) {
      // Returning a JSON response with an error message and a status code of 401 (Unauthorized)
      return NextResponse.json({ error: "Profile not verified" }, { status: 401 });
    }
    const { userSystemID } = profileInfo!;

    // delete the xml certificate in db
    const xmlDocDeleted = await deleteCertificate(userSystemID, nZKPCertType);
    if (!xmlDocDeleted?.acknowledged) {
      console.error("Age verification not deleted");
      throw new Error("Age verification not deleted");
    }
    return NextResponse.json({ message: "Age verification proof deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: (error as Error)?.message }, { status: 500 });
  }
}
