import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateReferralCode } from "@/lib/points";

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
          // Generate unique referral code
          let referralCode = generateReferralCode(user.name || "SKY");
          // Ensure uniqueness (retry on collision)
          let attempts = 0;
          while (attempts < 5) {
            const codeExists = await User.findOne({ referralCode });
            if (!codeExists) break;
            referralCode = generateReferralCode(user.name || "SKY");
            attempts++;
          }

          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            referralCode,
            points: 0,
            pointsHistory: [],
          });
          console.log(
            `[Auth] New user created: ${user.email} (code: ${referralCode})`
          );
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
