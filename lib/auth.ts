import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};


import crypto from 'crypto';

// ─── Domain helpers ───────────────────────────────────────────────────────────

export const UserRole = { USER: 'USER', ADMIN: 'ADMIN' } as const;
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const SubscriptionStatus = {
  FREE: 'FREE', TRIAL: 'TRIAL', ACTIVE: 'ACTIVE', CANCELED: 'CANCELED', PAST_DUE: 'PAST_DUE',
} as const;
export type SubscriptionStatusType = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export function isActiveSubscription(status: string | undefined | null): boolean {
  return status === 'ACTIVE' || status === 'TRIAL';
}
export function isAdmin(role: string | undefined | null): boolean {
  return role === 'ADMIN';
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({ where: { identifier: email } }).catch(() => null);
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
  return token;
}

export async function consumeVerificationToken(token: string): Promise<string> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) throw new Error('Token is invalid or has already been used.');
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null);
    throw new Error('Token has expired. Please request a new one.');
  }
  await prisma.verificationToken.delete({ where: { token } });
  return record.identifier;
}
