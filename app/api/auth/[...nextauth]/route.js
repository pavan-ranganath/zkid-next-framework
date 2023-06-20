import { dbConnect } from "@/lib/mongodb";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/lib/models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Sign in with email",
      async authorize(credentials) {
        await dbConnect();
        try {
          const user = await User.findOne({ email: credentials.email });
          if (user) {
            // check password
            const isPasswordCorrect = await user.comparePassword(
              credentials.password,
              user.password
            );
            if (isPasswordCorrect) {
              return user;
            } else {
              throw new Error("Incorrect credentials");
            }
          } else {
            throw new Error("User not found");
          }
        } catch (error) {
          console.error(error);
          throw new Error(error);
        }
      },
    }),
  ],
  pages: {
    error: "/login",
  },
});

export { handler as GET, handler as POST };
