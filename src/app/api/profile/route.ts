
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    telefone: z.string().optional(),
});

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse("Não autorizado", { status: 401 });
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email: session.user.email },
            select: {
                nome: true,
                email: true,
                telefone: true,
                role: true,
            },
        });

        if (!usuario) {
            return new NextResponse("Usuário não encontrado", { status: 404 });
        }

        return NextResponse.json(usuario);
    } catch (error) {
        console.error("[PROFILE_GET]", error);
        return new NextResponse("Erro interno", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse("Não autorizado", { status: 401 });
    }

    try {
        const body = await req.json();
        const { nome, telefone } = updateProfileSchema.parse(body);

        const usuario = await prisma.usuario.update({
            where: { email: session.user.email },
            data: {
                nome,
                telefone,
            },
        });

        return NextResponse.json(usuario);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Dados inválidos", { status: 400 });
        }
        console.error("[PROFILE_UPDATE]", error);
        return new NextResponse("Erro interno", { status: 500 });
    }
}
