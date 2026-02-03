import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const usuario = await prisma.usuario.findUnique({
                    where: { email: credentials.email },
                    include: { instrutor: true },
                });

                if (!usuario || !usuario.ativo) {
                    return null;
                }

                const senhaValida = await bcrypt.compare(
                    credentials.password,
                    usuario.senha
                );

                if (!senhaValida) {
                    return null;
                }

                return {
                    id: usuario.id,
                    email: usuario.email,
                    name: usuario.nome,
                    role: usuario.role,
                    instrutorId: usuario.instrutor?.id || null,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.instrutorId = user.instrutorId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.instrutorId = token.instrutorId as string | null;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
};
