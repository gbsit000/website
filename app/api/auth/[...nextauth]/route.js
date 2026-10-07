import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Email atau Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const body = {
          usernameOrEmail: credentials.usernameOrEmail,
          password: credentials.password,
        };

        if (!credentials?.usernameOrEmail || !credentials?.password) {
          throw new Error("Email/Username dan Password wajib diisi");
        }

        // 1. Cari user berdasarkan email ATAU username
        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { email: credentials.usernameOrEmail },
              { username: credentials.usernameOrEmail },
            ],
          },
          include: {
            role: true,
          },
        });

        if (!user) {
          throw new Error("Email/Username atau Password salah");
        }

        // 2. Cek kecocokan password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordValid) {
          throw new Error("Email/Username atau Password salah");
        }

        // 3. Kembalikan data untuk disimpan di Session
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role?.name || "user", // Contoh: "marketing", "admin", "supir"
        };
      },
    }),
  ],
  callbacks: {
    // Menyisipkan data role ke dalam token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    // Menyisipkan data token ke dalam session agar bisa dibaca di frontend
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Sesi login bertahan 1 hari
  },
  pages: {
    signIn: "/login", // Kita arahkan ke custom page /login milik kita sendiri
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
