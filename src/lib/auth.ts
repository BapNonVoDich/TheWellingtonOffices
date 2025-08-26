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
      }
      return token;
    },
    session({ session, token }) {
      // Lấy các thuộc tính từ token và gán vào session
      // Đây là phiên bản an toàn và rõ ràng nhất
      const safeTokenId = token.id as string | undefined;
      const safeTokenRole = token.role as string | undefined;

      if (session.user && safeTokenId && safeTokenRole) {
        session.user.id = safeTokenId;
        session.user.role = safeTokenRole;
      }
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
})