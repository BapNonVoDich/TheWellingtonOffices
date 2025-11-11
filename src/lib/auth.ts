// src/lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("Vui lòng định nghĩa biến môi trường NEXTAUTH_SECRET trong file .env");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours in seconds
    updateAge: 60 * 60, // 1 hour - refresh token every hour if user is active
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const employee = await prisma.employee.findUnique({
          where: { email: credentials.email as string }
        });
        if (!employee) {
          return null;
        }
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          employee.password
        );
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role,
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      // Khi đăng nhập, gán các thuộc tính từ user vào token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.iat = Math.floor(Date.now() / 1000); // Issue time
        token.exp = Math.floor(Date.now() / 1000) + (8 * 60 * 60); // Expire in 8 hours
      }
      
      // Refresh token if it's about to expire (within 1 hour)
      const now = Math.floor(Date.now() / 1000);
      if (token.exp && token.exp - now < 60 * 60) {
        token.exp = now + (8 * 60 * 60); // Extend expiration
      }
      
      return token;
    },
    session({ session, token }) {
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (token.exp && token.exp < now) {
        // Session expired - return session with expired date
        session.expires = new Date(0) as Date & string;
        return session;
      }
      
      // Lấy các thuộc tính từ token và gán vào session
      const safeTokenId = token.id as string | undefined;
      const safeTokenRole = token.role as string | undefined;

      if (session.user && safeTokenId && safeTokenRole) {
        session.user.id = safeTokenId;
        session.user.role = safeTokenRole;
        session.expires = new Date((token.exp as number) * 1000) as Date & string;
      }
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
})