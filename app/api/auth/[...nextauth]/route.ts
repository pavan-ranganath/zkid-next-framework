// The `[...nextauth]` file in Next.js is a special API route used by NextAuth for handling authentication requests.
// When using NextAuth, the [...nextauth] file is created in the pages/api/auth directory of your Next.js project.
// It serves as the entry point for handling authentication requests, such as signing in, signing out, and managing user sessions.

import { authOptions } from "@/lib/webauthn";
import NextAuth from "next-auth/next"; // NextAuth module for authentication

// Creating the authentication handler using NextAuth and the configured options
const handler = NextAuth(authOptions);

// Exporting the authentication handler as GET and POST
export { handler as GET, handler as POST };
