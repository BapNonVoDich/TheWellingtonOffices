import NextAuth from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcrypt';


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
        // Return user object that NextAuth expects
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
      if (user) {
        token.id = user.id;
        // @ts-expect-error -- user object has role from authorize callback
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      
      
      session.user.id = token.id as string;
      // @ts-expect-error -- session.user is extended with custom properties
      session.user.role = token.role;
      
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
})