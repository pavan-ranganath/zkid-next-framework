// Importing the necessary dependencies and modules

// Importing the 'jsonwebtoken' module for token generation and verification
// The 'jsonwebtoken' module is used for generating and verifying JSON Web Tokens (JWTs). JWTs are used for secure communication between parties, typically in client-server architectures.
import jwt from "jsonwebtoken";

// Importing the 'moment' module for working with dates and times
// The 'moment' module is used for working with dates, times, and durations. It provides a convenient way to parse, manipulate, and format dates and times in JavaScript.
import moment from "moment";

// Importing the 'Token' model for interacting with token documents in the database
import { Token } from "../models/token.model";

// Importing the 'tokenTypes' constant that defines different token types used in the application
// It defines different token types used in the application, such as 'verifyEmail' and 'registerNewDevice'. These token types help differentiate the purpose and usage of tokens in the system.
import { tokenTypes } from "../config/tokens";

/**
 * Generate token
 * @param {ObjectId} userId - The ID of the user for whom the token is generated
 * @param {Moment} expires - The expiration time of the token
 * @param {string} type - The type of the token
 * @param {string} [secret] - Optional secret key for token generation
 * @returns {string} - The generated token
 */
export const generateToken = (
  userId: any,
  expires: moment.Moment,
  type: string,
  secret: string = process.env.NEXTAUTH_SECRET!
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret as string);
};

/**
 * Save a token
 * @param {string} token - The token to be saved
 * @param {ObjectId} userId - The ID of the user associated with the token
 * @param {Moment} expires - The expiration time of the token
 * @param {string} type - The type of the token
 * @param {boolean} [blacklisted] - Optional flag indicating if the token is blacklisted
 * @returns {Promise<Token>} - The saved token document
 */
export const saveToken = async (
  token: string,
  userId: any,
  expires: moment.Moment,
  type: string,
  blacklisted: boolean = false
): Promise<any> => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token - The token to be verified
 * @param {string} type - The expected type of the token
 * @returns {Promise<Token>} - The verified token document
 */
export const verifyToken = async (token: string, type: any): Promise<any> => {
  const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  return tokenDoc;
};

/**
 * Generate verify email token
 * @param {User} user - The user for whom the email verification token is generated
 * @returns {Promise<string>} - The generated verify email token
 */
export const generateVerifyEmailToken = async (user: { id: any }): Promise<string> => {
  const expires = moment().add(process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES, "minutes");
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};
