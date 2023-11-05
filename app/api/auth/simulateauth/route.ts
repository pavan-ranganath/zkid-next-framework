import { NextRequest, NextResponse } from "next/server";

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
  getValidatedIdTokenClaims,
  processAuthorizationCodeOAuth2Response,
} from "oauth4webapi";
// Import the `getSession` and `setSession` functions from the "@/lib/sessionMgmt" module
// Used to get and set session data in the server response
import { getSession, removeSession, setSession } from "@/lib/sessionMgmt";
import { ResponseInternal } from "next-auth/core";
import { DIGILOCKER_SESSION_NAME, DIGILOCKER_USER_SESSION_NAME } from "@/lib/constants";
import { NextApiResponse } from "next";
import { redirect } from "next/navigation";

const oidcClientId = process.env.SIMULATE_DL_CLIENT_ID!;
const oidcClientSecret = process.env.SIMULATE_DL_CLIENT_SECRET;
const oidcTokenUrl = process.env.SIMULATE_DL_CLIENT_TOKEN_URL;
const oidcAuthorizationnUrl = process.env.SIMULATE_DL_AUTH_TOKEN_URL;
const digilockerIssuerUrl = process.env.SIMULATE_DL_ISSUER_URL;
const nextAuthAppUrl = process.env.NEXTAUTH_URL!;

const redirect_uri = `${nextAuthAppUrl}/api/auth/simulateauth`;
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
  authorizationUrl.searchParams.set("state", state);

  // acr=aadhaar+email+mobile
  const resp: ResponseInternal = { redirect: authorizationUrl.toString(), status: 200 };
  const response = NextResponse.json(resp);
  setSession(response, { name: DIGILOCKER_SESSION_NAME, value: { code_verifier, state } });
  return response;
}

export async function GET(req: NextRequest, context: any) {
  try {
    const session = getSession(req, DIGILOCKER_SESSION_NAME) as any;
    if (!session) {
      throw new Error("Invalid session");
    }
    const { code_verifier, state: stateInSession } = session;
    const currentUrl: URL = new URL(req.nextUrl);
    const err = currentUrl.searchParams.get("error");
    if (err) {
      if (err === "access_denied") {
        throw new Error("Access denied");
      }
      throw new Error(err);
    }
    const params = validateAuthResponse(as, client, currentUrl, stateInSession);
    if (isOAuth2Error(params)) {
      throw new Error(params.error_description);
    }
    const responseFromDigilocker = await authorizationCodeGrantRequest(as, client, params, redirect_uri, code_verifier);
    // const userToken = await processAuthorizationCodeOpenIDResponse(as, client, responseFromDigilocker);
    // if (isOAuth2Error(userToken)) {
    //   throw new Error(userToken.error_description);
    // }
    // const idTokenClaims = getValidatedIdTokenClaims(userToken);
    const userToken = await processAuthorizationCodeOAuth2Response(as, client, responseFromDigilocker);
    const redirectUrl = new URL("/dashboard/profile", nextAuthAppUrl);

    const response = NextResponse.json({ redirect: true }, { status: 302, headers: { Location: redirectUrl.toString() } });
    setSession(response, { name: DIGILOCKER_USER_SESSION_NAME, value: { token: userToken } }, 600);
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occured. Please check the logs for more details.";
    const redirectUrl = new URL("/error", nextAuthAppUrl);
    redirectUrl.searchParams.set("error", errorMessage);
    const response = NextResponse.json({ redirect: true }, { status: 302, headers: { Location: redirectUrl.toString() } });
    return response;
  }
}