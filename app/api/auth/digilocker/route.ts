import { NextRequest, NextResponse } from "next/server";
import next from "next-auth"; // NextAuth module for authentication
import { AuthOptions } from "next-auth";
import { OAuthConfig } from "next-auth/providers/oauth";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";
// import { getBody, setCookie, toResponse } from "next-auth/src/next/utils";
import {
  authorizationCodeGrantRequest,
  AuthorizationServer,
  calculatePKCECodeChallenge,
  Client,
  generateRandomCodeVerifier,
  generateRandomState,
  validateAuthResponse,
  isOAuth2Error,
  processAuthorizationCodeOpenIDResponse,
  OpenIDTokenEndpointResponse,
} from "oauth4webapi";
// Import the `getSession` and `setSession` functions from the "@/lib/sessionMgmt" module
// Used to get and set session data in the server response
import { getSession, removeSession, setSession } from "@/lib/sessionMgmt";
import { ResponseInternal } from "next-auth/core";

const oidcClientId = process.env.DIGILOCKER_CLIENT_ID!;
const oidcClientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
const oidcTokenUrl = process.env.DIGILOCKER_CLIENT_TOKEN_URL;
const oidcAuthorizationnUrl = process.env.DIGILOCKER_AUTH_TOKEN_URL;
const digilockerIssuerUrl = process.env.DIGILOCKER_ISSUER_URL;

export const DIGILOCKER_SESSION_NAME = "digiLockerAuthSession";
export const DIGILOCKER_USER_SESSION_NAME = "digiLockerUserSession";
export const RUN_DIGI_LOCKERVERIFICATION_ALGORITHM = "runDigiLockerVerificationAlgorithm";
const redirect_uri = "http://localhost:3000/api/auth/digilocker";
const client: Client = {
  issuer: digilockerIssuerUrl,
  client_id: oidcClientId,
  client_secret: oidcClientSecret,
  redirect_uri,
  token_endpoint_auth_method: "client_secret_basic", // Adjust as needed
};
const as: AuthorizationServer = {
  issuer: digilockerIssuerUrl!,
  authorization_endpoint: oidcAuthorizationnUrl,
  token_endpoint: oidcTokenUrl,
};
export async function POST(req: NextRequest) {
  const code_verifier = generateRandomCodeVerifier();
  const code_challenge = await calculatePKCECodeChallenge(code_verifier);
  const code_challenge_method = "S256";
  const state = generateRandomState();
  const authorizationUrl = new URL(as.authorization_endpoint!);
  authorizationUrl.searchParams.set("client_id", client.client_id);
  authorizationUrl.searchParams.set("code_challenge", code_challenge);
  authorizationUrl.searchParams.set("code_challenge_method", code_challenge_method);
  authorizationUrl.searchParams.set("redirect_uri", redirect_uri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid");
  authorizationUrl.searchParams.set("state", state);
  const resp: ResponseInternal = { redirect: authorizationUrl.toString(), status: 200 };
  const response = NextResponse.json(resp);
  setSession(response, { name: DIGILOCKER_SESSION_NAME, value: { code_verifier, state } });
  return response;
}

export async function GET(req: NextRequest, context: any) {
  const session = getSession(req, DIGILOCKER_SESSION_NAME) as any;
  if (!session) {
    const errResp = NextResponse;
    errResp.json({ error_description: "Session does not exist" });
    errResp.error();
    return errResp;
  }
  const { code_verifier, state: stateInSession } = session;
  const currentUrl: URL = new URL(req.nextUrl);
  const params = validateAuthResponse(as, client, currentUrl, stateInSession);
  if (isOAuth2Error(params)) {
    console.log("error", params);
    const errResp = NextResponse;
    errResp.json(params);
    errResp.error();
    return errResp;
  }
  const responseFromDigilocker = await authorizationCodeGrantRequest(as, client, params, redirect_uri, code_verifier);
  const userToken = await processAuthorizationCodeOpenIDResponse(as, client, responseFromDigilocker);
  if (isOAuth2Error(userToken)) {
    const errResp = NextResponse;
    errResp.json(userToken);
    errResp.error();
    return errResp;
  }
  const redirectUrl = new URL("/dashboard/profile", req.url);
  // redirectUrl.searchParams.set("digiLoginSuccess", "true");
  const response = NextResponse.redirect(redirectUrl.toString());
  // store userToken in session
  setSession(response, { name: DIGILOCKER_USER_SESSION_NAME, value: userToken }, 36000);
  // const resWithCookieVer = setSession(resWithCookie, { name: RUN_DIGI_LOCKERVERIFICATION_ALGORITHM, value: true }, 36000);
  // remove auth session
  // removeSession(response, DIGILOCKER_SESSION_NAME);
  return response;
}

// get token from session
export async function getToken(req: NextRequest) {
  const session: OpenIDTokenEndpointResponse = getSession(req, DIGILOCKER_USER_SESSION_NAME) as OpenIDTokenEndpointResponse;
  if (!session) {
    const errResp = NextResponse;
    errResp.json({ error_description: "Session does not exist" });
    errResp.error();
    return errResp;
  }

  return session;
}
