import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Auto-save user to MongoDB on first login
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
          console.log("[Auth] New user created:", user.email);
        }
      } catch (error) {
        console.error("[Auth] Error saving user:", error);
        // Don't block login if DB save fails
      }
      return true;
    },
    async session({ session }) {
      // Session already has user.name, email, image from Google
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirect to home if custom sign-in needed
  },
});
