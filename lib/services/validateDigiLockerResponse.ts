import axios, { AxiosResponse, AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import CryptoJS from "crypto-js";

/**
 * Validates the HTTP response headers for integrity and content type.
 * @param response The Axios response object.
 * @param expectedContentType The expected content type (e.g., 'application/xml').
 * @param clientSecret The client secret used for HMAC calculation.
 * @returns True if headers are valid; otherwise, false.
 */
export async function validateResponseHeaders(
  response: Response,
  expectedContentType: string,
  clientSecret: string,
): Promise<boolean> {
  const headers = response.headers;

  // Check Content-Type
  if (headers.get("content-type") !== expectedContentType) {
    console.error("Invalid Content-Type");
    return false;
  }

  // Check hmac
  const receivedHmac = headers.get("hmac");
  if (!receivedHmac) {
    console.error("HMAC header missing");
    return false;
  }

  // Calculate and validate HMAC
  const fileData = await response.text(); // Assuming the response contains the file data
  const calculatedHmac = calculateHmac(fileData, clientSecret);

  if (receivedHmac !== calculatedHmac) {
    console.error("Invalid HMAC");
    return false;
  }

  // All checks passed; headers are valid
  return true;
}

/**
 * Calculates the HMAC of the given data using SHA-256 and the client secret.
 * @param data The data for which to calculate the HMAC.
 * @param clientSecret The client secret used for HMAC calculation.
 * @returns The calculated HMAC.
 */
function calculateHmac(data: string, clientSecret: string): string {
  const hmac = CryptoJS.HmacSHA256(data, clientSecret);
  return hmac.toString(CryptoJS.enc.Base64);
}
