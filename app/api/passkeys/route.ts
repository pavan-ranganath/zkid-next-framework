import { NextRequest, NextResponse } from "next/server"; // Importing NextRequest and NextResponse from the "next/server" module for handling HTTP requests and responses
import mongoose from "mongoose"; // Importing Mongoose for MongoDB database connection and querying
import { dbConnect } from "@/lib/mongodb"; // Importing the "dbConnect" function from the local module "@/lib/mongodb" for connecting to the MongoDB database
import { getServerSession } from "next-auth"; // Importing the "getServerSession" function from the "next-auth" module for retrieving the user session
import { credentailsFromTb } from "@/app/dashboard/users/service"; // Importing the "credentailsFromTb" type from the local module "@/app/dashboard/users/service" for defining the type of a collection document
import { authOptions } from "../auth/[...nextauth]/route"; // Importing the "authOptions" object from the local module "../auth/[...nextauth]/route" for configuring authentication options
import { getSession, removeSession } from "@/lib/sessionMgmt";
import { OpenIDTokenEndpointResponse, protectedResourceRequest } from "oauth4webapi";
import API_CONFIG from "@/lib/services/apiConfig";
import { XadesClass } from "@/lib/services/XadesClass";
import { AadhaarXmlParser, matchFormDataAndAadharData, setAadhaar } from "@/lib/services/aadhaarService";
import { DbCredential } from "@/lib/webauthn";
import { sendEmailVerification } from "../auth/emailverifier/route";

// Defining a type for the filter object
export type filter = {
  id: string;
  value: string;
};

// Handling the GET request
// retrieves data based on the user's email
export async function GET(req: NextRequest, context: any) {
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

  try {
    // check digilocker verification flag in session
    const digiLockerUserSession = getSession(req, "digiLockerUserSession") as any;
    if (!!digiLockerUserSession) {
      const { access_token, expires_in } = digiLockerUserSession;
      const { method, pathTemplate } = API_CONFIG["DIGILOCKER"].paths["eAadhaar"];
      const { apiUrl } = API_CONFIG["DIGILOCKER"];
      const responseDigi = await protectedResourceRequest(
        access_token,
        method,
        new URL(apiUrl + pathTemplate),
        new Headers(),
        null,
      );
      const xmlAadharString = await responseDigi.text();
      const xades = new XadesClass();
      const xmlVerify = xmlAadharString ? await xades.verifyXml(xmlAadharString) : false;
      if (!xmlVerify) {
        console.error("XML verification failed");
        throw new Error("XML verification failed");
      }
      const xmlAadhar = new AadhaarXmlParser(xmlAadharString);
      await xmlAadhar.parseXml();
      if (!xmlAadhar) {
        console.error("XML parsing failed");
        throw new Error("XML parsing failed");
      }
      const poi = xmlAadhar.extractPoiAttributes;
      if (!poi) {
        console.error("Poi extraction failed");
        throw new Error("Poi extraction failed");
      }

      // Find the credentials associated with the provided email in the database
      const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
        userID: email,
      });
      if (!credentials) {
        console.error("Credentials not found");
        throw new Error("Credentials not found");
      }
      const matched = await matchFormDataAndAadharData(poi, credentials);
      if (matched) {
        const storedAadhar = await setAadhaar(xmlAadharString, email);
        if (!storedAadhar) {
          console.error("Aadhaar not stored");
          throw new Error("Aadhaar not stored");
        }
        await sendEmailVerification(email);
      } else {
        console.error("Aadhaar data does not match");
        throw new Error("Aadhaar data does not match");
      }
    }

    // Accessing the "credentials" collection from the MongoDB database
    const collection = mongoose.connection.db.collection<credentailsFromTb>("credentials");

    // Querying the collection to find a document with the matching userID
    const data = await collection.findOne({ userID: email });
    const response = NextResponse.json(data);
    // remove  digilocker cookie
    removeSession(response, "digiLockerUserSession");
    // Returning a JSON response with the retrieved data
    return response;
  } catch (error) {
    // Handling any errors that occur during the API request processing
    console.error("Error processing API request:", error);

    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
