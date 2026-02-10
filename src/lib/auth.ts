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
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.instrutorId = token.instrutorId as string | null;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
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

// Função auxiliar para verificar se o usuário é administrador (incluindo ENCARREGADO)
export function isAdmin(role: string): boolean {
    return role === "ADMIN" || role === "ENCARREGADO";
}
