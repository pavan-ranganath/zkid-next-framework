import cookie from "cookie"; // Importing the 'cookie' library for cookie serialization and parsing
import jwt from "jsonwebtoken"; // Importing the 'jsonwebtoken' library for creating and verifying JSON Web Tokens
import { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server"; // Importing Next.js server utilities for handling requests and responses

// Retrieving the secret for signing and verifying JWTs from environment variables
const secret = process.env.NEXTAUTH_SECRET!;

/**
 * Sets the session by creating a signed JWT and setting it as a cookie in the response.
 * @param res The Next.js response object to set the cookie in.
 * @param session The session object containing the data to be signed and stored in the cookie.
 */
export function setSession(res: NextResponse, session: { name: string; value: any }, age: number = 600) {
  // Creating a signed JWT using the session data and the secret
  const token = jwt.sign(session.value, secret);

  // Serializing the JWT as a cookie value with specified options
  const cookieValue = cookie.serialize(session.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: age, // 5 minutes (in seconds)
    sameSite: "lax",
    path: "/",
  });

  res.headers.set("Set-Cookie", cookieValue);
}

/**
 * Retrieves the session from the request by verifying and decoding the JWT from the cookie.
 * @param req The Next.js request object containing the cookie to extract the session from.
 * @returns The session data if the JWT is valid, otherwise null.
 */
export function getSession(req: NextRequest, sessionName: string) {
  // Retrieving the JWT token from the 'session' cookie in the request
  const token = req.cookies.get(sessionName)?.value;

  // If the token is not present, return null indicating no session
  if (!token) return null;

  try {
    // Verifying and decoding the JWT using the secret
    return jwt.verify(token, secret);
  } catch (err) {
    // If verification fails, return null indicating no session
    return null;
  }
}

/**
 * Destroys the session by setting an expired cookie in the response.
 * @param res The response object to set the expired cookie in.
 */
export function destroySession(res: { setHeader: (arg0: string, arg1: string) => void }) {
  // Setting an empty and expired 'session' cookie in the response headers
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // Setting the expiration date to the past
      sameSite: "strict",
      path: "/",
    }),
  );
}

// remove a cookie in session
export function removeSession(res: NextResponse, sessionName: string) {
  // Setting an empty and expired 'session' cookie in the response headers
  res.headers.set(
    "Set-Cookie",
    cookie.serialize(sessionName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // Setting the expiration date to the past
      sameSite: "strict",
      path: "/",
    }),
  );
}
