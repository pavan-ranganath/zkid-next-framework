import { setSession, removeSession, getSession } from "@/lib/sessionMgmt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { DIGILOCKER_USER_SESSION_NAME } from "../auth/digilocker/route";
import { OpenIDTokenEndpointResponse, protectedResourceRequest } from "oauth4webapi";
import API_CONFIG from "@/lib/services/apiConfig";
import { apiRequest } from "@/lib/services/apiService";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import { validateResponseHeaders } from "@/lib/services/validateDigiLockerResponse";
import { AadhaarXmlParser, matchFormDataAndAadharData, setAadhaar } from "@/lib/services/aadhaarService";
import { XadesClass } from "@/lib/services/XadesClass";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { DbCredential } from "@/lib/webauthn";
import { sendEmailVerification } from "../auth/emailverifier/route";

export async function GET(req: NextRequest, event: NextFetchEvent) {
  const session: OpenIDTokenEndpointResponse = getSession(req, "digiLockerUserSession") as any;
  if (!session) {
    console.error("Session does not exist");
    const errResp = NextResponse;
    errResp.json({ error_description: "Session does not exist" });
    // errResp.error();
    return errResp;
  }
  // deconstruct items in session
  const { access_token, expires_in } = session;
  const { method, pathTemplate } = API_CONFIG["DIGILOCKER"].paths["eAadhaar"];
  const { apiUrl } = API_CONFIG["DIGILOCKER"];
  const responseDigi = await protectedResourceRequest(
    access_token,
    method,
    new URL(apiUrl + pathTemplate),
    new Headers(),
    null,
  );
  // const response = await responseDigi.text();
  const respClone = responseDigi.clone();
  const validateRes = await validateResponseHeaders(respClone, "application/xml", process.env.DIGILOCKER_CLIENT_SECRET!);
  if (!validateRes) {
    console.error("Validation of header failed");
    const errResp = NextResponse;
    errResp.json({ error_description: "Validation of header failed" }, { status: 401 });
    return errResp;
  }
  const xmlAadharString = await responseDigi.text();
  const serverSession = await getServerSession();

  const userEmail = serverSession?.user?.email;
  if (!userEmail) {
    console.error("User email not found");
    const errResp = NextResponse;
    errResp.json({ error_description: "User email not found" }, { status: 401 });
    return errResp;
  }
  const xades = new XadesClass();
  const xmlVerify = xmlAadharString ? await xades.verifyXml(xmlAadharString) : false;
  if (!xmlVerify) {
    console.error("XML verification failed");
    const errResp = NextResponse;
    errResp.json({ error_description: "XML verification failed" }, { status: 401 });
    return errResp;
  }

  const xmlAadhar = new AadhaarXmlParser(xmlAadharString);
  await xmlAadhar.parseXml();
  if (!xmlAadhar) {
    console.error("XML parsing failed");
    const errResp = NextResponse;
    errResp.json({ error_description: "XML parsing failed" }, { status: 401 });
    return errResp;
  }
  const poi = xmlAadhar.extractPoiAttributes;
  if (!poi) {
    console.error("Poi extraction failed");
    const errResp = NextResponse;
    errResp.json({ error_description: "Poi extraction failed" }, { status: 401 });
    return errResp;
  }
  const poa = xmlAadhar.extractPoaAttributes;

  const storedAadhar = await setAadhaar(xmlAadharString, userEmail);
  if (!storedAadhar) {
    console.error("Aadhaar not stored");
    const errResp = NextResponse.json({ error_description: "Aadhaar not stored" }, { status: 401 });
    return errResp;
  }
  // Establishing a connection to the database
  await dbConnect();
  // Find the credentials associated with the provided email in the database
  const credentials = await mongoose.connection.db.collection<DbCredential>("credentials").findOne({
    userID: userEmail,
  });
  if (!credentials) {
    console.error("Credentials not found");
    const errResp = NextResponse.json({ error_description: "Credentials not found" });
    return errResp;
  }
  const matched = await matchFormDataAndAadharData(poi, credentials);
  if (matched) {
    let emailSent = await sendEmailVerification(userEmail);
    return emailSent;
  }
  const errResp = NextResponse.json({ error_description: "Aadhaar data does not match" }, { status: 401 });
  return errResp;
}
