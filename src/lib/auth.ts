import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "google") return false;

      const googleId = account.providerAccountId;

      await prisma.user.upsert({
        where: { googleId },
        update: {
          email: user.email ?? "",
          name: user.name ?? "",
          avatarUrl: user.image ?? null,
        },
        create: {
          googleId,
          email: user.email ?? "",
          name: user.name ?? "",
          avatarUrl: user.image ?? null,
          totalXp: 0,
          level: 1,
          streakFreezesAvailable: 0,
        },
      });

      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        const dbUser = await prisma.user.findUnique({
          where: { googleId: account.providerAccountId },
        });
        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
