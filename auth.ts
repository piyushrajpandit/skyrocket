import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateReferralCode, awardPoints } from "@/lib/points";

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
          let attempts = 0;
          while (attempts < 5) {
            const codeExists = await User.findOne({ referralCode });
            if (!codeExists) break;
            referralCode = generateReferralCode(user.name || "SKY");
            attempts++;
          }

          // Read referral cookie (set by middleware from ?ref= param)
          let referredBy: string | undefined;
          try {
            const cookieStore = await cookies();
            const refCookie = cookieStore.get("skymock_ref");
            if (refCookie?.value) {
              // Verify the referral code exists and isn't the user's own
              const referrer = await User.findOne({
                referralCode: refCookie.value.toUpperCase(),
              });
              if (referrer && referrer.email !== user.email) {
                referredBy = refCookie.value.toUpperCase();
              }
            }
          } catch {
            // Cookie read may fail in some contexts — not critical
          }

          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            referralCode,
            referredBy,
            points: 0,
            pointsHistory: [],
          });

          console.log(
            `[Auth] New user created: ${user.email} (code: ${referralCode}${
              referredBy ? `, referred by: ${referredBy}` : ""
            })`
          );

          // Award 200 points to the referrer for successful signup
          if (referredBy) {
            const referrer = await User.findOne({
              referralCode: referredBy,
            });
            if (referrer) {
              awardPoints(
                referrer.email,
                `Referral signup by ${user.name}`,
                200
              ).catch((err) => {
                console.error("[Referral] Signup bonus failed:", err);
              });
              console.log(
                `[Referral] +200 to ${referrer.email} for ${user.email} signup`
              );
            }
          }
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
