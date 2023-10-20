import { NextRequest, NextResponse } from "next/server"; // Importing NextRequest and NextResponse from the "next/server" module for handling HTTP requests and responses
import mongoose from "mongoose"; // Importing Mongoose for MongoDB database connection and querying
import { dbConnect } from "@/lib/mongodb"; // Importing the "dbConnect" function from the local module "@/lib/mongodb" for connecting to the MongoDB database
import { getServerSession } from "next-auth"; // Importing the "getServerSession" function from the "next-auth" module for retrieving the user session
import { getSession, removeSession } from "@/lib/sessionMgmt";
import { OpenIDTokenEndpointResponse, getValidatedIdTokenClaims, protectedResourceRequest } from "oauth4webapi";
import API_CONFIG from "@/lib/services/apiConfig";
import { XadesClass } from "@/lib/services/XadesClass";
import { AadhaarXmlParser, matchFormDataAndAadharData, setDigilockerInfo } from "@/lib/services/aadhaarService";
import { DbCredential, authOptions } from "@/lib/webauthn";
import { checkDigiLockerID } from "@/lib/services/storage";
import { credentailsFromTb } from "@/lib/services/userService";
import { sendEmailVerification } from "../auth/emailverifier/route";
const phtPlaceholder =
  "/9j/4AAQSkZJRgABAQACWAJYAAD/2wCEAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDIBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/CABEIAMgAyAMBIgACEQEDEQH/xAAtAAEAAwEBAQAAAAAAAAAAAAAAAwQFAgEHAQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEAMQAAAA+vCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZpcpVRJJXF65i9G2ilAAAAAAAAKNCSMCgALGrhbkegAAAAAAc9cGKKAAAbeJsxIAAAAAABBPRKAoAABrZN+LwAAAAAAFW1yYiaGgAAGnS1Y6AAAAAAABWy93JIBQAnLtkgAAAAAAABSs5xXFANDPsRqo5AAAAAAA4ql2PMhJoSgAAJtPGRusi0XXHYAABHncwgUAAAAAAAsVxsyZGvADkMQUAAAAAAAAA2yOgf/8QAMRAAAQIDBAgGAQUAAAAAAAAAAQIDBBEhABIwUQUTIDEyQEFhIjNScXKBEBRDU3CR/9oACAEBAAE/AP6gdiWmhVQKvSN9nI91VESQO2+36h7+Vf8AtkRr6d6gr5CyNIqn42wRmmzTyHhNBnmOo5IkAEkyAtExhWbjRkjqc9pC1NrCkGRFmHg+3eFCKEZHkdIOkANA76qwIN3VvgT8KqHkYhzWvrV0nIe2BOVbJM0A5jHWZIUcgThIM20nsMd7yHPicJjyG/iMeKdS20Qqc1AgSwoV1DjQCZzSADPH0l+2ffC0ducPtjx6L0Pe9JnhQCLsPe9RnjrQHEKQrcRI2iIcw6wJzBEwZYEPDmIWROQAmTKyEBtCUJ3ASHIRrWsYmN6a/WBBNatiZ3qr9clFMahynCqo2oVjXu14U1Pfk9I+W38jtaO8tz5DknHkNJmtQGQ6m0VEh8gBMkpz67ULE6gqBSSlWXSzbyHUzQoHMdRyDsQ01xLE8hU2iXg+7fAIEpVwIZ4MO3yCRKVLNRDTvCsTyNDiLeba41gdutnNIIFG0FXc0s5FvOb1SGSaYjcW83uVMZKrZvSCDRxBT3FbIebd4Fg9uu288hhF5X0M7OxjrlAbick8k1GOt0JvpyVZl5D6LyfsZbMS6Xn1GdBQe3KQzpafSZ0ND7bCzdbUcgTyyDebScwD+P/EABQRAQAAAAAAAAAAAAAAAAAAAHD/2gAIAQIBAT8AKf/EABQRAQAAAAAAAAAAAAAAAAAAAHD/2gAIAQMBAT8AKf/Z";
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

  let error = "";
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
    breakme: if (digiLockerUserSession) {
      const { token, idTokenClaims } = digiLockerUserSession;
      const { access_token } = token;
      const { method, pathTemplate } = API_CONFIG.DIGILOCKER.paths.eAadhaar;
      const { apiUrl } = API_CONFIG.DIGILOCKER;
      console.log("idTokenClaims", idTokenClaims);
      const checkIfDigilockerIdExists = await checkDigiLockerID(idTokenClaims.user_sso_id, email);
      if (checkIfDigilockerIdExists) {
        error = "Digilocker already linked to an account";
        break breakme;
      }
      const responseDigilockerAaadhaar = await protectedResourceRequest(
        access_token,
        method,
        new URL(apiUrl + pathTemplate),
        new Headers(),
        null,
      );
      const status = responseDigilockerAaadhaar.status;
      if (status !== 200) {
        const err = await responseDigilockerAaadhaar.json();
        if (err === "insufficient_scope") {
          error = "Please provide consent for Aadhaar";
          console.error("Insufficient scope");
          break breakme;
        }
        error = err.description ? err.description : "Failed to fetch Aadhaar from Digilocker";
        console.error("Failed to fetch Aadhaar from Digilocker");
        break breakme;
      }
      const xmlAadharString = await responseDigilockerAaadhaar.text();

      console.log("xmlAadharString", xmlAadharString);
      const xades = new XadesClass();
      const xmlVerify = xmlAadharString ? await xades.verifyXml(xmlAadharString) : false;
      if (!xmlVerify) {
        error = "XML verification failed";
        console.error("XML verification failed");
        break breakme;
      }
      const xmlAadhar = new AadhaarXmlParser(xmlAadharString);
      await xmlAadhar.parseXml();
      if (!xmlAadhar) {
        console.error("XML parsing failed");
        error = "XML parsing failed";
        break breakme;
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
        error = "Credentials not found";
        break breakme;
      }
      const matched = await matchFormDataAndAadharData(poi, credentials);
      if (matched) {
        const storedAadhar = await setDigilockerInfo({ aadhaar: xmlAadharString, digiLockerUserInfo: idTokenClaims }, email);
        if (!storedAadhar) {
          console.error("Aadhaar not stored");
          error = "Aadhaar not stored";
          break breakme;
        }
        await sendEmailVerification(email);
      } else {
        console.error("Aadhaar data does not match");
        error = "Aadhaar data does not match";
        break breakme;
      }
    }

    // Accessing the "credentials" collection from the MongoDB database
    const collection = mongoose.connection.db.collection<credentailsFromTb>("credentials");

    // Querying the collection to find a document with the matching userID
    const data = await collection.findOne({ userID: email });
    let pht = phtPlaceholder;
    if (!data) {
      // Returning a JSON response with an error message and a status code of 404 (Not Found)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { aadhaar } = data;
    if (aadhaar) {
      const xmlAadhar = new AadhaarXmlParser(aadhaar.aadhaar);
      await xmlAadhar.parseXml();
      if (xmlAadhar.extractPhtValue) {
        pht = xmlAadhar.extractPhtValue;
      }
    }
    const response = NextResponse.json(
      { data: { ...data, photo: pht }, error: error ? `Verification failed: ${error}` : "" },
      { status: 200 },
    );
    // remove  digilocker cookie
    removeSession(response, "digiLockerUserSession");
    // Returning a JSON response with the retrieved data
    return response;
  } catch (_error) {
    // Handling any errors that occur during the API request processing
    console.error("Error processing API request:", _error);

    // Returning a JSON response with an error message and a status code of 500 (Internal Server Error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
