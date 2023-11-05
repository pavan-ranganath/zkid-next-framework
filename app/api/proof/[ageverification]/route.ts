// In this file, we can define any type of request as follows:
// export async function GET(Request) {}
// export async function HEAD(Request) {}
// export async function POST(Request) {}
// export async function PUT(Request) {}
// export async function DELETE(Request) {}

import { dbConnect } from "@/lib/mongodb";
import { AadhaarXmlParser } from "@/lib/services/aadhaarService";
import { checkProfileVerification } from "@/lib/services/userService";
import { epochToDate, utcTimestampToDateOfBirth } from "@/lib/services/utils";
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
    const xmlAadhar = new AadhaarXmlParser(aadhaar!.personData);
    await xmlAadhar.parseXml();
    if (!xmlAadhar) {
      console.error("XML parsing failed");
      throw new Error("XML parsing failed");
    }

    // const userClaimDate = moment(claimDate).toDate();
    // const userDOBInDB = moment(dob.value).toDate();
    console.log("dob.value", dob.value);
    const userClaimDate = utcTimestampToDateOfBirth(+claimDate);
    const userDOBInDB = utcTimestampToDateOfBirth(+dob.value);
    console.log("userClaimDate", userClaimDate);
    console.log("userDOBInDB", userDOBInDB);
    // calulate age as per claim date and dob
    // check if age is less than claimed age
    // if yes, then return error
    const calculatedAge = moment(userClaimDate).diff(userDOBInDB, "years");
    if (claimAge > calculatedAge) {
      console.error("Claimed age and date mismatch");
      return NextResponse.json({ error: "Claimed age and date mismatch" }, { status: 400 });
    }

    const photo = xmlAadhar.extractPhtValue;
    // const photo =
    //   "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";
    if (!photo) {
      console.error("Photo not found");
      throw new Error("Photo not found");
    }

    const signedXmlCertificateWithZKproof = await generateProofForAgeverification(
      userDOBInDB,
      fullName.value,
      userSystemID,
      photo,
      claimAge,
      userClaimDate,
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
